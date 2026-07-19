import { IsString } from 'class-validator';
import { CreatePlanInput } from './create-plan.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePlanInput extends PartialType(CreatePlanInput) {
  @Field(() => String)
  @IsString()
  id: string;
}
