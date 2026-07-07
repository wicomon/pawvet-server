import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class RestorePasswordInput {
  @Field(() => String)
  nickName: string;
}
