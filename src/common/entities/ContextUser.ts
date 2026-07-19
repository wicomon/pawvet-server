import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class ContextPlan {
  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
class ContextSubscription {
  @Field(() => String)
  status: string;

  @Field(() => Date)
  currentPeriodEnd: Date;

  @Field(() => Date, { nullable: true })
  trialEndsAt?: Date;

  @Field(() => Boolean)
  isComplimentary: boolean;

  @Field(() => ContextPlan, { nullable: true })
  plan?: ContextPlan;
}

@ObjectType()
class ContextCompany {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ContextSubscription, { nullable: true })
  subscription?: ContextSubscription;
}

@ObjectType()
class ContextMenu {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  path: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  position: string;

  @Field(() => Int)
  order: number;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [ContextMenu], { nullable: true })
  subMenu?: ContextMenu[];
}

@ObjectType()
class ContextRole {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => Boolean)
  canCreate: boolean;

  @Field(() => Boolean)
  canRead: boolean;

  @Field(() => Boolean)
  canUpdate: boolean;

  @Field(() => Boolean)
  canDelete: boolean;
}

@ObjectType()
export class ContextUser {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => ContextCompany)
  company: ContextCompany;

  @Field(() => ContextRole)
  role: ContextRole;

  @Field(() => [ContextMenu])
  menus?: ContextMenu[];
}
