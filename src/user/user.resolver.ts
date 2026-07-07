import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaSelect } from 'src/common/types';
import { SelectFields } from 'src/common/decorators/selected-fields.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ContextUser } from 'src/common/entities/ContextUser';
import { CurrentUser } from 'src/common/decorators';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'userFindAll' })
  findAll(
    @SelectFields() select: PrismaSelect,
    @CurrentUser(/* [ValidRoles.admin] */) user: ContextUser,
  ) {
    return this.userService.findAll(select, user);
  }

  @Query(() => User, { name: 'userById' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @SelectFields() select: PrismaSelect,
    @CurrentUser(/* [ValidRoles.admin] */) user: ContextUser,
  ) {
    return this.userService.findOne(id, select, user);
  }

  @Mutation(() => Boolean, { name: 'userCreate' })
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser([ValidRoles.ROOT, ValidRoles.ADMIN]) user: ContextUser,
  ) {
    return this.userService.create(createUserInput, user);
  }

  @Mutation(() => Boolean, { name: 'userUpdate' })
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.ROOT, ValidRoles.ADMIN]) user: ContextUser,
  ) {
    return this.userService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => Boolean, { name: 'userRemove' })
  removeUser(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser([ValidRoles.ROOT, ValidRoles.ADMIN]) user: ContextUser,
  ) {
    return this.userService.remove(id, user);
  }
}
