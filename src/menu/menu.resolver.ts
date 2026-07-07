import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { ContextUser } from 'src/common/entities/ContextUser';
import { CurrentUser, SelectFields } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { PrismaSelect } from 'src/common/types';

@UseGuards(JwtAuthGuard)
@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Query(() => [Menu], { name: 'menuFindAll' })
  findAll(
    @SelectFields() select: PrismaSelect,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.menuService.findAll(select, user);
  }

  @Query(() => Menu, { name: 'menuFindById' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @SelectFields() select: PrismaSelect,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.menuService.findOne(id, select, user);
  }

  @Mutation(() => Boolean, { name: 'menuCreate' })
  createMenu(
    @Args('createMenuInput') createMenuInput: CreateMenuInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.menuService.create(createMenuInput, user);
  }

  @Mutation(() => Boolean, { name: 'menuUpdate' })
  updateMenu(
    @Args('updateMenuInput') updateMenuInput: UpdateMenuInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    console.log('menu resolver');
    return this.menuService.update(updateMenuInput.id, updateMenuInput, user);
  }

  @Mutation(() => Boolean, { name: 'menuRemove' })
  removeMenu(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.menuService.remove(id, user);
  }
}
