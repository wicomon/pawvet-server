import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { CommonService } from 'src/common/services/common.service';
import { PrismaSelect } from 'src/common/types';
import { ContextUser } from 'src/common/entities/ContextUser';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly common: CommonService,
  ) {}

  async findAll(select: PrismaSelect, contextUser: ContextUser) {
    try {
      const menus = await this.prisma.menu.findMany({
        where: {
          parentId: null,
          isActive: true,
        },
        select,
      });
      return menus;
    } catch (error) {
      this.common.handleErrors(error);
    }
  }

  async findOne(id: string, select: PrismaSelect, contextUser: ContextUser) {
    try {
      const menu = await this.prisma.menu.findUnique({
        where: { id, isActive: true },
        select: {
          ...select,
          // subMenu: {
          //   select: {
          //     ...select,
          //     subMenu: {
          //       select
          //     }
          //   },
          // },
        },
      });
      if (!menu) throw new NotFoundException(`Menu not found`);
      // console.log(menu)
      return menu;
    } catch (error) {
      this.common.handleErrors(error);
    }
  }

  async create(createMenuInput: CreateMenuInput, contextUser: ContextUser) {
    try {
      const newMenu = await this.prisma.menu.create({
        data: {
          ...createMenuInput,
          createdBy: contextUser.id,
          updatedBy: contextUser.id,
        },
      });
      return true;
    } catch (error) {
      this.common.handleErrors(error);
    }
  }

  async update(
    id: string,
    updateMenuInput: UpdateMenuInput,
    contextUser: ContextUser,
  ) {
    try {
      const existingMenu = await this.prisma.menu.findUnique({
        where: { id },
      });
      if (!existingMenu) throw new NotFoundException(`Menu not found`);

      await this.prisma.menu.update({
        where: { id },
        data: {
          ...updateMenuInput,
          updatedBy: contextUser.id,
        },
      });
      return true;
    } catch (error) {
      this.common.handleErrors(error);
    }
  }

  async remove(id: string, contextUser: ContextUser) {
    try {
      const existingMenu = await this.prisma.menu.findUnique({
        where: { id },
      });
      if (!existingMenu) throw new NotFoundException(`Menu not found`);

      await this.prisma.menu.update({
        where: { id },
        data: {
          updatedBy: contextUser.id,
          isActive: false,
        },
      });
      return true;
    } catch (error) {
      this.common.handleErrors(error);
    }
  }
}
