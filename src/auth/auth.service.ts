import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInput } from './dto/inputs/login.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { CommonService } from 'src/common/services/common.service';
import * as encrypter from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordInput } from './dto/inputs/change-password.input';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Caché en memoria del árbol usuario+rol+menús resuelto en cada request
  // autenticada (JwtStrategy.validate -> userById). Evita repetir, en cada
  // llamada GraphQL, un select anidado de 5-6 niveles contra Postgres.
  // TTL corto: los cambios de permisos/rol tardan como mucho USER_CACHE_TTL_MS
  // en reflejarse salvo que se invalide explícitamente (ver invalidateUserCache
  // / clearUserCache, llamados desde user.service.ts y role.service.ts).
  // Nota: si se escala a >1 instancia, mover este cache a Redis (Fase C).
  private readonly userCache = new Map<
    string,
    { value: unknown; expiresAt: number }
  >();
  private readonly USER_CACHE_TTL_MS = 30_000;

  invalidateUserCache(userId: string) {
    this.userCache.delete(userId);
  }

  clearUserCache() {
    this.userCache.clear();
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId, msg: 'generated' });
  }

  async login(loginInput: LoginInput) {
    try {
      const { email, password } = loginInput;

      const existsUser = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!existsUser)
        throw new BadRequestException('Email/password incorrectos');

      if (!(await encrypter.compare(password, existsUser.password)))
        throw new BadRequestException('Email/password incorrectos');

      const token = this.getJwtToken(existsUser.id);

      return {
        token,
      };
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async validateToken(token: string) {
    try {
      this.jwtService.verify(token);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Invalid token: ${message}`);
      return false;
    }
  }

  async getUserInfo(token: string) {
    try {
      const { id } = this.jwtService.verify(token);
      const user = await this.userById(id);

      return user;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async changePassword(
    token: string,
    changePasswordInput: ChangePasswordInput,
  ) {
    try {
      const { id } = this.jwtService.verify(token);
      const userId = id;
      const { currentPassword, newPassword } = changePasswordInput;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      if (!(await encrypter.compare(currentPassword, user.password)))
        throw new BadRequestException('La contraseña actual es incorrecta');

      const hashedPassword = await encrypter.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      this.invalidateUserCache(userId);

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async userById(id: string) {
    const cached = this.userCache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
            menus: {
              select: {
                menu: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    position: true,
                    path: true,
                    order: true,
                    icon: true,
                    description: true,
                    subMenu: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                        type: true,
                        position: true,
                        path: true,
                        order: true,
                        icon: true,
                        description: true,
                        subMenu: {
                          select: {
                            id: true,
                            name: true,
                            code: true,
                            type: true,
                            position: true,
                            path: true,
                            order: true,
                            icon: true,
                            description: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isActive) throw new UnauthorizedException('User inactive');

    const formatedUser = {
      ...user,
      menus: user.role.menus
        .map((rm) => rm.menu)
        .sort((a, b) => a.order - b.order),
    };

    this.userCache.set(id, {
      value: formatedUser,
      expiresAt: Date.now() + this.USER_CACHE_TTL_MS,
    });

    return formatedUser;
  }
}
