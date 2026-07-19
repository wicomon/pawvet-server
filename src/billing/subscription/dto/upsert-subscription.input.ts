import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from '../../billing.enums';

@InputType()
export class UpsertSubscriptionInput {
  @Field(() => String)
  @IsString()
  companyId: string;

  @Field(() => String)
  @IsString()
  planId: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isComplimentary?: boolean;

  // Días de prueba desde ahora: fija status=TRIAL y calcula
  // trialEndsAt/currentPeriodEnd. Ignora currentPeriodEnd si se envía junto.
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
