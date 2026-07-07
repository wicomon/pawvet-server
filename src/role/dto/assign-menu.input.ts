import { InputType, Int, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class AssignMenuInput {
  @Field(() => String)
  @IsString()
  roleId: string;

  @Field(() => [String])
  @IsString({ each: true })
  menuIds: string[];
}
