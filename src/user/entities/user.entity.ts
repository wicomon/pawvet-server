import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Company } from 'src/company/entities/company.entity';
import { Role } from 'src/role/entities/role.entity';

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String)
  companyId: string;

  @Field(() => String)
  roleId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  createdBy?: string;

  @Field(() => String, { nullable: true })
  updatedBy?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Company)
  company: Company;
}
