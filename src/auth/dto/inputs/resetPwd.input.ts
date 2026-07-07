import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsPositive, Min, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field(() => Int)
  @IsNumber()
  @IsPositive()
  @Min(1)
  idUser: number;

  // @Field(() => String)
  // @MinLength(5,{message: 'Contraseña debe ser mínimo de 5 digitos'})
  // password: string;
}
