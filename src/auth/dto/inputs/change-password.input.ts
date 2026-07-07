import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsPositive, Min, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  @MinLength(5, { message: 'Contraseña debe ser mínimo de 5 digitos' })
  currentPassword: string;

  @Field(() => String)
  @MinLength(5, { message: 'Contraseña debe ser mínimo de 5 digitos' })
  newPassword: string;
}
