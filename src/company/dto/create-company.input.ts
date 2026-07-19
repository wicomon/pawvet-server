import { InputType, Int, Field } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from 'src/billing/billing.enums';

@InputType()
export class CreateCompanyInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  slug: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ruc?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  website?: string;

  // Toda empresa nace con un plan; en UpdateCompanyInput (PartialType) queda opcional.
  @Field(() => String)
  @IsString()
  planId: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isComplimentary?: boolean;

  // Días de prueba desde ahora: fija status=TRIAL y calcula
  // trialEndsAt/currentPeriodEnd (mismo comportamiento que UpsertSubscriptionInput).
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  trialDays?: number;

  @Field(() => Date, { nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  currentPeriodEnd?: Date;

  @Field(() => SubscriptionStatus, { nullable: true })
  @IsOptional()
  status?: SubscriptionStatus;
}
