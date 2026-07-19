import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateSubscriptionPaymentInput {
  @Field(() => String)
  @IsString()
  companyId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  // "yape" | "transfer" | "cash" — cobro manual/offline (ver CLAUDE.md)
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  method?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field(() => Date, { nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  paidAt?: Date;

  // Cantidad de meses que cubre el pago (siempre meses, sin importar si el
  // plan es mensual o anual). Para renovar un plan anual, enviar months: 12.
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  months: number;
}
