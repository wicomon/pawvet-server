import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { PrismaSelect } from 'src/common/types';
import { CommonService } from 'src/common/services/common.service';
import { AuthService } from 'src/auth/auth.service';
import { ContextUser } from 'src/common/entities/ContextUser';

// price/amount son Decimal(12,2) y no serializan directo a GraphQL Float
// (mismo patrón que toPlanEntity/toSubscriptionEntity/toPaymentEntity en
// src/billing). El select acá es dinámico (@SelectFields), así que estos
// campos pueden no venir pedidos: se convierten solo si están presentes.
function normalizeCompanyBilling<T extends Record<string, any> | null>(
  company: T,
): T {
  if (!company) return company;
  const plan = company.subscription?.plan;
  if (plan?.price instanceof Prisma.Decimal) {
    plan.price = plan.price.toNumber();
  }
  if (Array.isArray(company.subscriptionPayments)) {
    for (const payment of company.subscriptionPayments) {
      if (payment.amount instanceof Prisma.Decimal) {
        payment.amount = payment.amount.toNumber();
      }
    }
  }
  return company;
}

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async findAll(select: PrismaSelect) {
    try {
      const companies = await this.prisma.company.findMany({
        where: {
          isActive: true,
        },
        select,
      });
      return companies.map(normalizeCompanyBilling);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findOne(id: string, select: PrismaSelect) {
    try {
      const user = await this.prisma.company.findUnique({
        where: { id },
        select,
      });
      if (!user) {
        throw new NotFoundException(
          'La empresa que intenta consultar no existe',
        );
      }
      return normalizeCompanyBilling(user);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  // Crea la empresa y su suscripción en una sola transacción: el front antes
  // hacía 2 llamadas (companyCreate + subscriptionUpsert); si la suscripción
  // fallara aquí, no debe quedar una empresa huérfana sin plan.
  async create(
    createCompanyInput: CreateCompanyInput,
    contextUser: ContextUser,
  ) {
    try {
      const {
        planId,
        trialDays,
        currentPeriodEnd,
        isComplimentary,
        status,
        ...companyData
      } = createCompanyInput;

      const [existsCompany, plan] = await Promise.all([
        this.prisma.company.findFirst({ where: { slug: companyData.slug } }),
        this.prisma.plan.findUnique({ where: { id: planId } }),
      ]);

      if (existsCompany) {
        throw new ConflictException('Ya existe una empresa con ese slug');
      }
      if (!plan) {
        throw new BadRequestException('No existe el plan');
      }

      const now = new Date();
      let periodEnd = currentPeriodEnd;
      let subscriptionStatus = status;
      let trialEndsAt: Date | undefined;

      // Mismo cálculo que SubscriptionService.upsert: trialDays fija
      // TRIAL y calcula trialEndsAt/currentPeriodEnd.
      if (trialDays) {
        trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
        periodEnd = trialEndsAt;
        subscriptionStatus = subscriptionStatus ?? SubscriptionStatus.TRIAL;
      } else if (periodEnd) {
        subscriptionStatus = subscriptionStatus ?? SubscriptionStatus.FULL;
      }

      const newCompany = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            ...companyData,
            createdBy: contextUser.id,
            updatedBy: contextUser.id,
          },
        });

        await tx.subscription.create({
          data: {
            companyId: company.id,
            planId,
            status: subscriptionStatus ?? SubscriptionStatus.FULL,
            trialEndsAt,
            currentPeriodEnd: periodEnd ?? now,
            isComplimentary: isComplimentary ?? false,
            createdBy: contextUser.id,
            updatedBy: contextUser.id,
          },
        });

        return company;
      });

      return newCompany;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(
    id: string,
    updateCompanyInput: UpdateCompanyInput,
    contextUser: ContextUser,
  ) {
    try {
      const {
        id: _id,
        planId,
        trialDays,
        currentPeriodEnd,
        isComplimentary,
        status,
        ...companyData
      } = updateCompanyInput;

      const company = await this.prisma.company.findUnique({
        where: { id },
      });

      if (!company) {
        throw new BadRequestException(
          'La empresa que intenta actualizar no existe',
        );
      }

      if (planId) {
        const plan = await this.prisma.plan.findUnique({
          where: { id: planId },
        });
        if (!plan) {
          throw new BadRequestException('No existe el plan');
        }
      }

      const hasSubscriptionChanges =
        planId !== undefined ||
        trialDays !== undefined ||
        currentPeriodEnd !== undefined ||
        isComplimentary !== undefined ||
        status !== undefined;

      const now = new Date();
      let periodEnd = currentPeriodEnd;
      let subscriptionStatus = status;
      let trialEndsAt: Date | undefined;

      if (trialDays) {
        trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
        periodEnd = trialEndsAt;
        subscriptionStatus = subscriptionStatus ?? SubscriptionStatus.TRIAL;
      } else if (periodEnd) {
        subscriptionStatus = subscriptionStatus ?? SubscriptionStatus.FULL;
      }

      const updatedCompany = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.company.update({
          where: { id },
          data: { ...companyData, updatedBy: contextUser.id },
        });

        if (hasSubscriptionChanges) {
          await tx.subscription.update({
            where: { companyId: id },
            data: {
              ...(planId ? { planId } : {}),
              ...(subscriptionStatus ? { status: subscriptionStatus } : {}),
              ...(trialEndsAt ? { trialEndsAt } : {}),
              ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
              ...(isComplimentary !== undefined ? { isComplimentary } : {}),
              updatedBy: contextUser.id,
            },
          });
        }

        return updated;
      });

      // Cambios de plan/estado/cortesía afectan a los usuarios ya
      // autenticados de esta empresa (misma razón que SubscriptionService.upsert).
      if (hasSubscriptionChanges) {
        this.authService.clearUserCache();
      }

      return updatedCompany;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      const existCompany = await this.prisma.company.findUnique({
        where: { id },
      });

      if (!existCompany) {
        throw new NotFoundException(
          'La empresa que intenta eliminar no existe',
        );
      }

      const deletedCompany = await this.prisma.company.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
