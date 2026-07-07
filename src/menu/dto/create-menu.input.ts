import { InputType, Int, Field } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateMenuInput {
  @Field(() => String)
  @IsString()
  code: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  path: string;

  @Field(() => String)
  @IsString()
  type: string;

  @Field(() => String)
  @IsString()
  position: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parentId?: string;
}
