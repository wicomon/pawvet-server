import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationInput } from './dto/create-organization.input';
import { UpdateOrganizationInput } from './dto/update-organization.input';
import { PrismaService } from 'src/common/services/prisma.service';
import { PrismaSelect } from 'src/common/types';
import { CommonService } from 'src/common/services/common.service';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  async findAll(select: PrismaSelect) {
    try {
      return this.prisma.organization.findMany({
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
      const user = await this.prisma.organization.findUnique({
        where: { id },
        select,
      });
      if (!user) {
        throw new NotFoundException(
          'La organización que intenta consultar no existe',
        );
      }
      return user;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async create(createOrganizationInput: CreateOrganizationInput) {
    try {
      const existsOrganization = await this.prisma.organization.findFirst({
        where: {
          slug: createOrganizationInput.slug,
        },
      });

      if (existsOrganization) {
        throw new ConflictException('Ya existe una organización con ese slug');
      }

      const newOrganization = await this.prisma.organization.create({
        data: createOrganizationInput,
      });
      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async update(id: string, updateOrganizationInput: UpdateOrganizationInput) {
    try {
      // console.log({updateOrganizationInput, id})
      const organization = await this.prisma.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        throw new BadRequestException(
          'La organización que intenta actualizar no existe',
        );
      }

      const updatedOrganization = await this.prisma.organization.update({
        where: { id },
        data: updateOrganizationInput,
      });

      return true;
    } catch (error) {
      this.commonService.handleErrors(error);
    }
  }

  async remove(id: string) {
    try {
      const existOrganization = await this.prisma.organization.findUnique({
        where: { id },
      });

      if (!existOrganization) {
        throw new NotFoundException(
          'La organización que intenta eliminar no existe',
        );
      }

      const deletedOrganization = await this.prisma.organization.update({
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
