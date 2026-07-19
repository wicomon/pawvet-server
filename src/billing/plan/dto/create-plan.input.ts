import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PlanInterval } from '../../billing.enums';

@InputType()
export class CreatePlanInput {
  @Field(() => String)
  @IsString()
  code: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;

  @Field(() => PlanInterval, { nullable: true })
  @IsOptional()
  interval?: PlanInterval;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  whatsappNotifications?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  electronicInvoicing?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
