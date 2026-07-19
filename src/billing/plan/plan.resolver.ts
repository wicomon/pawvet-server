import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PlanService } from './plan.service';
import { Plan } from './entities/plan.entity';
import { CreatePlanInput } from './dto/create-plan.input';
import { UpdatePlanInput } from './dto/update-plan.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';

@UseGuards(JwtAuthGuard)
@Resolver(() => Plan)
export class PlanResolver {
  constructor(private readonly planService: PlanService) {}

  // Cualquier usuario autenticado puede ver el catálogo (p.ej. pantalla de
  // planes/upgrade); solo ROOT ve los planes desactivados como "pro".
  @Query(() => [Plan], { name: 'planFindAll' })
  findAll(@CurrentUser() user: ContextUser) {
    return this.planService.findAll(user);
  }

  @Mutation(() => Plan, { name: 'planCreate' })
  createPlan(
    @Args('createPlanInput') createPlanInput: CreatePlanInput,
    @CurrentUser([ValidRoles.ROOT]) _user: ContextUser,
  ) {
    return this.planService.create(createPlanInput);
  }

  @Mutation(() => Plan, { name: 'planUpdate' })
  updatePlan(
    @Args('updatePlanInput') updatePlanInput: UpdatePlanInput,
    @CurrentUser([ValidRoles.ROOT]) _user: ContextUser,
  ) {
    return this.planService.update(updatePlanInput.id, updatePlanInput);
  }
}
