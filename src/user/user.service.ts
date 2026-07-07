import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/common/services/prisma.service';
import * as encrypter from 'bcryptjs';
import { CommonService } from 'src/common/services/common.service';
import { PrismaSelect } from 'src/common/types';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async findAll(select: PrismaSelect, contextUser: ContextUser) {
    try {
      const isContextUserRoot = contextUser.role.slug === ValidRoles.ROOT;

      const users = await this.prismaService.user.findMany({
        where: {
          isActive: true,
          ...(isContextUserRoot
            ? {}
            : { organizationId: contextUser.organization.id }),
        },
        select,
      });
      return users;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findOne(id: string, select: PrismaSelect, contextUser: ContextUser) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        select,
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async create(createUserInput: CreateUserInput, contextUser: ContextUser) {
    try {
      const { password, organizationId, roleId, ...userData } = createUserInput;

      const existsOrganization =
        await this.prismaService.organization.findFirst({
          where: {
            id: organizationId,
          },
        });

      if (!existsOrganization) {
        throw new BadRequestException('No existe organización');
      }

      const existsUser = await this.prismaService.user.findFirst({
        where: {
          email: userData.email,
        },
      });

      if (existsUser) {
        throw new ConflictException(
          'Ya existe un usuario registrado con ese correo electrónico',
        );
      }

      const existsRole = await this.prismaService.role.findFirst({
        where: {
          id: roleId,
        },
      });

      if (!existsRole) {
        throw new BadRequestException('No existe rol');
      }

      const isContextUserRoot = contextUser.role.slug === ValidRoles.ROOT;
      const isCurrentRoleRoot = existsRole.slug === ValidRoles.ROOT;

      if (!isContextUserRoot && isCurrentRoleRoot) {
        throw new BadRequestException(
          'No tienes permisos para asignar el rol solicitado',
        );
      }

      const salt = await encrypter.genSalt();
      const encryptedPassword = await encrypter.hash(password.trim(), salt);

      const user = await this.prismaService.user.create({
        data: {
          ...userData,
          organizationId: isContextUserRoot
            ? organizationId
            : contextUser.organization.id,
          roleId: roleId,
          password: encryptedPassword,
          createdBy: contextUser.id,
          updatedBy: contextUser.id,
        },
      });
      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    contextUser: ContextUser,
  ) {
    try {
      const { password, ...restDto } = updateUserInput;

      const existingUser = await this.prismaService.user.findFirst({
        where: {
          id: id,
        },
        include: {
          role: true,
        },
      });
      if (!existingUser) {
        throw new NotFoundException(`Usuario no encontrado`);
      }
      const isCurrentUserRoot = contextUser.role.slug === ValidRoles.ROOT;
      const isExistingUserRoot = existingUser.role.slug === ValidRoles.ROOT;

      if (isExistingUserRoot && !isCurrentUserRoot) {
        throw new UnauthorizedException(
          'No tienes permisos para modificar este usuario',
        );
      }

      if (updateUserInput.organizationId) {
        const existsOrganization =
          await this.prismaService.organization.findFirst({
            where: {
              id: updateUserInput.organizationId,
            },
          });

        if (!existsOrganization) {
          throw new BadRequestException('No existe organización');
        }
        if (contextUser.role.slug !== ValidRoles.ROOT) {
          delete restDto.organizationId;
        }
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...restDto,
          updatedBy: contextUser.id,
        },
      });

      this.authService.invalidateUserCache(id);

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async remove(id: string, contextUser: ContextUser) {
    try {
      const existingUser = await this.prismaService.user.findFirst({
        where: {
          id: id,
          isActive: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundException(`Usuario con id ${id} no encontrado`);
      }
      const deletedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
          updatedBy: contextUser.id,
        },
        select: {
          id: true,
          // name: true,
          // code: true,
          isActive: true,
        },
      });

      this.authService.invalidateUserCache(id);

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
