import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyInput } from './dto/create-company.input';
import { UpdateCompanyInput } from './dto/update-company.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { PrismaSelect } from 'src/common/types';
import { CommonService } from 'src/common/services/common.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async findAll(select: PrismaSelect) {
    try {
      return this.prisma.company.findMany({
        where: {
          isActive: true,
        },
        select,
      });
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async findOne(id: string, select: PrismaSelect) {
    try {
      const user = await this.prisma.company.findUnique({
        where: { id },
        select,
      });
      if (!user) {
        throw new NotFoundException(
          'La empresa que intenta consultar no existe',
        );
      }
      return user;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async create(createCompanyInput: CreateCompanyInput) {
    try {
      const existsCompany = await this.prisma.company.findFirst({
        where: {
          slug: createCompanyInput.slug,
        },
      });

      if (existsCompany) {
        throw new ConflictException('Ya existe una empresa con ese slug');
      }

      const newCompany = await this.prisma.company.create({
        data: createCompanyInput,
      });
      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(id: string, updateCompanyInput: UpdateCompanyInput) {
    try {
      // console.log({updateCompanyInput, id})
      const company = await this.prisma.company.findUnique({
        where: { id },
      });

      if (!company) {
        throw new BadRequestException(
          'La empresa que intenta actualizar no existe',
        );
      }

      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: updateCompanyInput,
      });

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      const existCompany = await this.prisma.company.findUnique({
        where: { id },
      });

      if (!existCompany) {
        throw new NotFoundException(
          'La empresa que intenta eliminar no existe',
        );
      }

      const deletedCompany = await this.prisma.company.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }
}
