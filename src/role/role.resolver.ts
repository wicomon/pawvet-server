import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { PrismaSelect } from 'src/common/types';
import { CurrentUser, SelectFields } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { AssignMenuInput } from './dto/assign-menu.input';

@UseGuards(JwtAuthGuard)
@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => [Role], { name: 'roleFindAll' })
  findAll(
    @SelectFields() select: PrismaSelect,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.findAll(select, user);
  }

  @Query(() => Role, { name: 'roleFindOne' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @SelectFields() select: PrismaSelect,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.findOne(id, select, user);
  }

  @Mutation(() => Boolean, { name: 'roleCreate' })
  createRole(
    @Args('createRoleInput') createRoleInput: CreateRoleInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.create(createRoleInput, user);
  }

  @Mutation(() => Boolean, { name: 'roleUpdate' })
  updateRole(
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.update(updateRoleInput.id, updateRoleInput, user);
  }

  @Mutation(() => Boolean, { name: 'roleRemove' })
  removeRole(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.remove(id, user);
  }

  @Mutation(() => Boolean, { name: 'roleAssignMenus' })
  assignMenusToRole(
    @Args('assignMenuInput') assignMenuInput: AssignMenuInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.roleService.assignMenusToRole(assignMenuInput, user);
  }
}
