import { ObjectType, Field, Float } from '@nestjs/graphql';
import { PlanInterval } from '../../billing.enums';

@ObjectType()
export class Plan {
  @Field(() => String)
  id: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => String)
  currency: string;

  @Field(() => PlanInterval)
  interval: PlanInterval;

  @Field(() => Boolean)
  whatsappNotifications: boolean;

  @Field(() => Boolean)
  electronicInvoicing: boolean;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
