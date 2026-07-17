import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  ruc?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;
}
