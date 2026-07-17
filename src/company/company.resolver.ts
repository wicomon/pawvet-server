import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { PrismaSelect } from 'src/common/types';
import { SelectFields } from 'src/common/decorators';

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

  @Mutation(() => Boolean, { name: 'companyCreate' })
  createCompany(
    @Args('createCompanyInput')
    createCompanyInput: CreateCompanyInput,
  ) {
    return this.companyService.create(createCompanyInput);
  }

  @Mutation(() => Boolean, { name: 'companyUpdate' })
  updateCompany(
    @Args('updateCompanyInput')
    updateCompanyInput: UpdateCompanyInput,
  ) {
    return this.companyService.update(
      updateCompanyInput.id,
      updateCompanyInput,
    );
  }

  @Mutation(() => Boolean, { name: 'companyRemove' })
  removeCompany(@Args('id', { type: () => String }) id: string) {
    return this.companyService.remove(id);
  }
}
