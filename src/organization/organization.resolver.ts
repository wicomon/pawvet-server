import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationInput } from './dto/create-organization.input';
import { UpdateOrganizationInput } from './dto/update-organization.input';
import { PrismaSelect } from 'src/common/types';
import { SelectFields } from 'src/common/decorators';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly organizationService: OrganizationService) {}

  @Query(() => [Organization], { name: 'organizationFindAll' })
  findAll(@SelectFields() select: PrismaSelect) {
    return this.organizationService.findAll(select);
  }

  @Query(() => Organization, { name: 'organizationFindOne' })
  findOne(
    @Args('id', { type: () => String }) id: string,
    @SelectFields() select: PrismaSelect,
  ) {
    return this.organizationService.findOne(id, select);
  }

  @Mutation(() => Boolean, { name: 'organizationCreate' })
  createOrganization(
    @Args('createOrganizationInput')
    createOrganizationInput: CreateOrganizationInput,
  ) {
    return this.organizationService.create(createOrganizationInput);
  }

  @Mutation(() => Boolean, { name: 'organizationUpdate' })
  updateOrganization(
    @Args('updateOrganizationInput')
    updateOrganizationInput: UpdateOrganizationInput,
  ) {
    return this.organizationService.update(
      updateOrganizationInput.id,
      updateOrganizationInput,
    );
  }

  @Mutation(() => Boolean, { name: 'organizationRemove' })
  removeOrganization(@Args('id', { type: () => String }) id: string) {
    return this.organizationService.remove(id);
  }
}
