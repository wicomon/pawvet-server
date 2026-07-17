import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { ContextUser } from '../../common/entities/ContextUser';
import { ValidRoles } from '../enum/valid-roles.enum';

export const CurrentUser = createParamDecorator(
  async (roles: ValidRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;
    const userContext: ContextUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      company: {
        id: user.company.id,
        name: user.company.name,
      },
      role: {
        id: user.role.id,
        name: user.role.name,
        slug: user.role.slug,
        canCreate: user.role.canCreate,
        canRead: user.role.canRead,
        canUpdate: user.role.canUpdate,
        canDelete: user.role.canDelete,
      },
    };
    // console.log('decorator -----------------------------------', userContext);
    if (!user) {
      throw new InternalServerErrorException(
        `No user inside Request - Guard not implemented`,
      );
    }
    // console.log({userContext})
    // console.log({ValidRoles})
    // console.log({roles})
    if (roles.length === 0) return userContext;

    if (roles.includes(userContext.role.slug as ValidRoles)) {
      return userContext;
    }

    throw new ForbiddenException('Sin acceso - Rol no valido');
  },
);
