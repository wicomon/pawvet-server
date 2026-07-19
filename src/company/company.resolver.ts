import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { PrismaSelect } from 'src/common/types';
import { CurrentUser, SelectFields } from 'src/common/decorators';
import { ContextUser } from 'src/common/entities/ContextUser';
import { ValidRoles } from 'src/common/enum/valid-roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company], { name: 'companyFindAll' })
  findAll(@SelectFields() select: PrismaSelect) {
    return this.companyService.findAll(select);
  }

  @Query(() => Company, { name: 'companyFindOne' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @SelectFields() select: PrismaSelect,
  ) {
    return this.companyService.findOne(id, select);
  }

  // Operación de plataforma: crea la empresa junto con su suscripción
  // (plan, días de prueba, cortesía) en una sola llamada transaccional.
  
  @Mutation(() => Company, { name: 'companyCreate' })
  createCompany(
    @Args('createCompanyInput')
    createCompanyInput: CreateCompanyInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.companyService.create(createCompanyInput, user);
  }

  @Mutation(() => Company, { name: 'companyUpdate' })
  updateCompany(
    @Args('updateCompanyInput')
    updateCompanyInput: UpdateCompanyInput,
    @CurrentUser([ValidRoles.ROOT]) user: ContextUser,
  ) {
    return this.companyService.update(
      updateCompanyInput.id,
      updateCompanyInput,
      user,
    );
  }

  @Mutation(() => Boolean, { name: 'companyRemove' })
  removeCompany(@Args('id', { type: () => String }) id: string) {
    return this.companyService.remove(id);
  }
}
