import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { mapPrismaError } from '../utils/prisma-error.util';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);
  handleErrors(error: any) {
    this.logger.error(error);
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw mapPrismaError(error);
    }

    if (error.status) {
      // Preserve the original status instead of always mapping to 404
      throw new HttpException(error.response ?? error.message, error.status);
    }

    // Handle unknown errors
    throw new InternalServerErrorException('Internal Error');
  }
}
