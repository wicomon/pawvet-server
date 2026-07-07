import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Menu {
  @Field(() => String)
  id: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  position: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  path?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;

  @Field(() => [SubMenu], { nullable: 'itemsAndList' })
  subMenu?: SubMenu[];
}

@ObjectType()
export class SubMenu extends Menu {}
