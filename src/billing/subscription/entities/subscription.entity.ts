import { ObjectType, Field } from '@nestjs/graphql';
import { Plan } from '../../plan/entities/plan.entity';
import { SubscriptionStatus } from '../../billing.enums';

@ObjectType()
export class Subscription {
  @Field(() => String)
  id: string;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  planId: string;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field(() => Date, { nullable: true })
  trialEndsAt?: Date;

  @Field(() => Date)
  currentPeriodEnd: Date;

  @Field(() => Boolean)
  cancelAtPeriodEnd: boolean;

  @Field(() => Date, { nullable: true })
  canceledAt?: Date;

  @Field(() => Boolean)
  isComplimentary: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Plan, { nullable: true })
  plan?: Plan;
}
