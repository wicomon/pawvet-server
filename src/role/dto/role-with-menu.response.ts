import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from '../entities/role.entity';

@ObjectType()
export class RoleMenuItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class RoleWithMenu extends Role {
  @Field(() => [RoleMenuItem])
  menus: RoleMenuItem[];
}
