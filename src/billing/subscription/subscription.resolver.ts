import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { UpsertSubscriptionInput } from './dto/upsert-subscription.input';
import { CreateSubscriptionPaymentInput } from './dto/create-subscription-payment.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';

@UseGuards(JwtAuthGuard)
@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Panel de administración de la plataforma: todas las empresas.
  @Query(() => [Subscription], { name: 'subscriptionFindAll' })
  findAll(@CurrentUser([ValidRoles.ROOT]) user: ContextUser) {
    return this.subscriptionService.findAll(user);
  }

  // ROOT puede pasar companyId; el resto siempre recibe la de su propia
  // empresa sin importar lo que envíe (ver resolveCompanyId en el service).
  @Query(() => Subscription, { name: 'subscriptionFindByCompany' })
  findByCompany(
    @CurrentUser() user: ContextUser,
    @Args('companyId', { type: () => String, nullable: true })
    companyId?: string,
  ) {
    return this.subscriptionService.findByCompany(companyId, user);
  }

  @Mutation(() => Subscription, { name: 'subscriptionUpsert' })
  upsertSubscription(
    @Args('upsertSubscriptionInput') input: UpsertSubscriptionInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.subscriptionService.upsert(input, user);
  }

  @Mutation(() => Subscription, { name: 'subscriptionCancel' })
  cancelSubscription(
    @Args('companyId', { type: () => String }) companyId: string,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.subscriptionService.cancel(companyId, user);
  }

  @Query(() => [SubscriptionPayment], { name: 'subscriptionPaymentFindAll' })
  findAllPayments(
    @CurrentUser() user: ContextUser,
    @Args('companyId', { type: () => String, nullable: true })
    companyId?: string,
  ) {
    return this.subscriptionService.findPayments(companyId, user);
  }

  @Mutation(() => SubscriptionPayment, { name: 'subscriptionPaymentCreate' })
  createPayment(
    @Args('createSubscriptionPaymentInput')
    input: CreateSubscriptionPaymentInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.subscriptionService.createPayment(input, user);
  }
}
