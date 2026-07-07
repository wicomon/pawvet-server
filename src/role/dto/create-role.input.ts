import { InputType, Int, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  slug: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean)
  @IsBoolean()
  canRead: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  canCreate: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  canUpdate: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  canDelete: boolean;
}
