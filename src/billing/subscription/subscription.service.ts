import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { CommonService } from 'src/common/services/common.service';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { AuthService } from 'src/auth/auth.service';
import { UpsertSubscriptionInput } from './dto/upsert-subscription.input';
import { CreateSubscriptionPaymentInput } from './dto/create-subscription-payment.input';

const subscriptionWithPlan = { plan: true } satisfies Prisma.SubscriptionInclude;

// `price`/`amount` son Decimal en Prisma y no serializan directo a GraphQL
// Float: se convierten explícitamente en cada punto de salida.
function toSubscriptionEntity<
  T extends { plan?: { price: Prisma.Decimal } | null },
>(subscription: T) {
  return {
    ...subscription,
    plan: subscription.plan
      ? { ...subscription.plan, price: subscription.plan.price.toNumber() }
      : subscription.plan,
  };
}

function toPaymentEntity<T extends { amount: Prisma.Decimal }>(payment: T) {
  return { ...payment, amount: payment.amount.toNumber() };
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  private resolveCompanyId(companyId: string | undefined, contextUser: ContextUser) {
    const isRoot = contextUser.role.slug === ValidRoles.ROOT;
    // No-ROOT solo puede ver/operar la suscripción de su propia empresa,
    // sin importar qué companyId haya enviado (mismo patrón que user.service.ts).
    return isRoot && companyId ? companyId : contextUser.company.id;
  }

  async findAll(contextUser: ContextUser) {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        include: subscriptionWithPlan,
        orderBy: { currentPeriodEnd: 'asc' },
      });

      return subscriptions.map(toSubscriptionEntity);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findByCompany(companyId: string | undefined, contextUser: ContextUser) {
    try {
      const targetCompanyId = this.resolveCompanyId(companyId, contextUser);

      const subscription = await this.prisma.subscription.findUnique({
        where: { companyId: targetCompanyId },
        include: subscriptionWithPlan,
      });

      if (!subscription) {
        throw new NotFoundException('La empresa no tiene una suscripción');
      }

      return toSubscriptionEntity(subscription);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async upsert(input: UpsertSubscriptionInput, contextUser: ContextUser) {
    try {
      const { companyId, planId, trialDays, currentPeriodEnd, ...rest } = input;

      const [company, plan] = await Promise.all([
        this.prisma.company.findUnique({ where: { id: companyId } }),
        this.prisma.plan.findUnique({ where: { id: planId } }),
      ]);

      if (!company) throw new BadRequestException('No existe empresa');
      if (!plan) throw new BadRequestException('No existe el plan');

      const now = new Date();
      let periodEnd = currentPeriodEnd;
      let status = rest.status;
      let trialEndsAt: Date | undefined;

      if (trialDays) {
        trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
        periodEnd = trialEndsAt;
        status = status ?? SubscriptionStatus.TRIAL;
      } else if (periodEnd) {
        status = status ?? SubscriptionStatus.FULL;
      }

      const subscription = await this.prisma.subscription.upsert({
        where: { companyId },
        include: subscriptionWithPlan,
        create: {
          companyId,
          planId,
          status: status ?? SubscriptionStatus.FULL,
          trialEndsAt,
          currentPeriodEnd: periodEnd ?? now,
          isComplimentary: rest.isComplimentary ?? false,
          createdBy: contextUser.id,
          updatedBy: contextUser.id,
        },
        update: {
          planId,
          ...(status ? { status } : {}),
          ...(trialEndsAt ? { trialEndsAt } : {}),
          ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
          ...(rest.isComplimentary !== undefined
            ? { isComplimentary: rest.isComplimentary }
            : {}),
          updatedBy: contextUser.id,
        },
      });

      this.authService.clearUserCache();

      return toSubscriptionEntity(subscription);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  // Cancelar no revoca acceso: solo marca la intención de no renovar. La
  // empresa conserva acceso hasta currentPeriodEnd (útil también a futuro
  // con pasarela/cobro automático: el worker de renovación vería
  // cancelAtPeriodEnd=true y simplemente no volvería a cobrar).
  async cancel(companyId: string, contextUser: ContextUser) {
    try {
      const existing = await this.prisma.subscription.findUnique({
        where: { companyId },
      });

      if (!existing) {
        throw new NotFoundException('La empresa no tiene una suscripción');
      }

      const subscription = await this.prisma.subscription.update({
        where: { companyId },
        include: subscriptionWithPlan,
        data: {
          canceledAt: new Date(),
          cancelAtPeriodEnd: true,
          updatedBy: contextUser.id,
        },
      });

      this.authService.clearUserCache();

      return toSubscriptionEntity(subscription);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findPayments(companyId: string | undefined, contextUser: ContextUser) {
    try {
      const isRoot = contextUser.role.slug === ValidRoles.ROOT;
      const targetCompanyId =
        isRoot && companyId ? companyId : contextUser.company.id;

      const payments = await this.prisma.subscriptionPayment.findMany({
        where: { companyId: targetCompanyId },
        orderBy: { paidAt: 'desc' },
      });

      return payments.map(toPaymentEntity);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  // Cobro manual/offline (Yape, transferencia, efectivo). Registra el pago
  // y, en la misma transacción, extiende y activa la suscripción según la
  // cantidad de meses pagados (ver CLAUDE.md: cobro manual, sin pasarela por
  // ahora). `months` siempre son meses, sin importar el intervalo del plan;
  // para renovar un plan anual el front debe enviar months: 12.
  async createPayment(
    input: CreateSubscriptionPaymentInput,
    contextUser: ContextUser,
  ) {
    try {
      const { companyId, amount, method, reference, notes, paidAt, months } =
        input;

      const subscription = await this.prisma.subscription.findUnique({
        where: { companyId },
        include: { plan: true },
      });

      if (!subscription) {
        throw new BadRequestException(
          'La empresa no tiene una suscripción a la cual aplicar el pago',
        );
      }

      const now = new Date();
      const base =
        subscription.currentPeriodEnd > now
          ? subscription.currentPeriodEnd
          : now;
      const newEnd = addMonths(base, months);

      const payment = await this.prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { companyId },
          data: {
            currentPeriodEnd: newEnd,
            status: SubscriptionStatus.FULL,
            cancelAtPeriodEnd: false,
            canceledAt: null,
            updatedBy: contextUser.id,
          },
        });

        return tx.subscriptionPayment.create({
          data: {
            companyId,
            subscriptionId: subscription.id,
            planId: subscription.planId,
            amount,
            currency: subscription.plan.currency,
            status: PaymentStatus.PAID,
            method,
            reference,
            notes,
            paidAt: paidAt ?? now,
            periodStart: base,
            periodEnd: newEnd,
            createdBy: contextUser.id,
            updatedBy: contextUser.id,
          },
        });
      });

      this.authService.clearUserCache();

      return toPaymentEntity(payment);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
