import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CommonService } from 'src/common/services/common.service';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { AuthService } from 'src/auth/auth.service';
import { CreatePlanInput } from './dto/create-plan.input';
import { UpdatePlanInput } from './dto/update-plan.input';
import { Prisma } from '@prisma/client';

// Un plan (Decimal `price`) no serializa directo a GraphQL Float: se
// convierte explícitamente en cada punto de salida de este service.
function toPlanEntity<T extends { price: Prisma.Decimal }>(plan: T) {
  return { ...plan, price: plan.price.toNumber() };
}

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}

  async findAll(contextUser: ContextUser) {
    try {
      const isRoot = contextUser.role.slug === ValidRoles.ROOT;

      const plans = await this.prisma.plan.findMany({
        where: isRoot ? {} : { isActive: true },
        orderBy: { price: 'asc' },
      });

      return plans.map(toPlanEntity);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async create(createPlanInput: CreatePlanInput) {
    try {
      const existsPlan = await this.prisma.plan.findUnique({
        where: { code: createPlanInput.code },
      });

      if (existsPlan) {
        throw new ConflictException('Ya existe un plan con ese código');
      }

      const plan = await this.prisma.plan.create({
        data: createPlanInput,
      });

      return toPlanEntity(plan);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(id: string, updatePlanInput: UpdatePlanInput) {
    try {
      const existsPlan = await this.prisma.plan.findUnique({ where: { id } });

      if (!existsPlan) {
        throw new NotFoundException('El plan que intenta actualizar no existe');
      }

      const { id: _id, ...data } = updatePlanInput;

      const plan = await this.prisma.plan.update({
        where: { id },
        data,
      });

      // El plan afecta a las empresas suscritas a él (features/estado); se
      // invalida todo el caché igual que en role.service.ts.
      this.authService.clearUserCache();

      return toPlanEntity(plan);
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
