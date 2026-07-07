import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { PrismaSelect } from 'src/common/types';
import { CommonService } from 'src/common/services/common.service';
import { ContextUser } from 'src/common/entities/ContextUser';
import { AssignMenuInput } from './dto/assign-menu.input';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async findAll(select: PrismaSelect, contextUser: ContextUser) {
    try {
      const roles = await this.prisma.role.findMany({
        where: {
          isActive: true,
        },
        select,
      });
      return roles;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findOne(id: string, select: PrismaSelect, contextUser: ContextUser) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
        select,
      });
      if (!role) {
        throw new NotFoundException('El rol que intenta consultar no existe');
      }
      return role;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async create(createRoleInput: CreateRoleInput, contextUser: ContextUser) {
    try {
      const existsRole = await this.prisma.role.findFirst({
        where: {
          name: createRoleInput.name,
        },
      });

      if (existsRole) {
        throw new ConflictException('Ya existe un rol con ese nombre');
      }

      const newRole = await this.prisma.role.create({
        data: createRoleInput,
      });

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(
    id: string,
    updateRoleInput: UpdateRoleInput,
    contextUser: ContextUser,
  ) {
    try {
      const existsRole = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!existsRole) {
        throw new NotFoundException('El rol que intenta actualizar no existe');
      }

      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: updateRoleInput,
      });

      // Un rol es compartido por varios usuarios; invalidamos todo el
      // caché de usuario en vez de rastrear a quién afecta este rol.
      this.authService.clearUserCache();

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async remove(id: string, contextUser: ContextUser) {
    try {
      const existsRole = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!existsRole) {
        throw new NotFoundException('El rol que intenta eliminar no existe');
      }

      const deletedRole = await this.prisma.role.update({
        where: { id },
        data: { isActive: false },
      });

      this.authService.clearUserCache();

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async assignMenusToRole(
    assignMenusDto: AssignMenuInput,
    contextUser: ContextUser,
  ) {
    try {
      const { roleId, menuIds } = assignMenusDto;

      const existsRole = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!existsRole) {
        throw new NotFoundException('El rol que intenta actualizar no existe');
      }

      // validar que los menus solo no tengan parentId
      const menus = await this.prisma.menu.findMany({
        where: {
          id: { in: menuIds },
          parentId: null,
        },
      });

      if (menus.length !== menuIds.length) {
        throw new BadRequestException(
          'Uno o más menús son inválidos o no son menús principales',
        );
      }

      const roles = await this.prisma.$transaction(async (tx) => {
        // remove existing menu assignments for the role
        await tx.roleMenu.deleteMany({
          where: { roleId },
        });

        // create new menu assignments
        const createRoleMenus = menuIds.map((menuId) => ({
          roleId,
          menuId,
          createdBy: contextUser.id,
          updatedBy: contextUser.id,
        }));

        await tx.roleMenu.createMany({
          data: createRoleMenus,
        });

        return true;
      });

      this.authService.clearUserCache();

      return roles;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
