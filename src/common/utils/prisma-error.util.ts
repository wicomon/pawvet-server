import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Maps a known Prisma error code to the equivalent Nest HTTP exception.
 * Shared between CommonService.handleErrors (try/catch path) and
 * AllExceptionsFilter (uncaught path) so the mapping lives in one place.
 */
export function mapPrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): HttpException {
  switch (error.code) {
    case 'P2000':
      return new BadRequestException('Provided value is too long');
    case 'P2002':
      return new BadRequestException('Unique constraint failed');
    case 'P2003':
      return new BadRequestException('Foreign key constraint failed');
    case 'P2005':
      return new BadRequestException('Invalid Field Type');
    case 'P2025':
      return new NotFoundException('Record not found');
    default:
      return new InternalServerErrorException('Database error');
  }
}
