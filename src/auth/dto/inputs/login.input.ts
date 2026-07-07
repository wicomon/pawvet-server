import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @MinLength(5, { message: 'Contraseña debe ser mínimo de 5 digitos' })
  password: string;
}
