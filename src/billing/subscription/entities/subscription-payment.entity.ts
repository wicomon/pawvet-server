import { ObjectType, Field, Float } from '@nestjs/graphql';
import { PaymentStatus } from '../../billing.enums';

@ObjectType()
export class SubscriptionPayment {
  @Field(() => String)
  id: string;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  subscriptionId: string;

  @Field(() => String, { nullable: true })
  planId?: string;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => String, { nullable: true })
  method?: string;

  @Field(() => String, { nullable: true })
  reference?: string;

  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Field(() => Date, { nullable: true })
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
