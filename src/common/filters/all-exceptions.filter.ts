import {
  Catch,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { mapPrismaError } from '../utils/prisma-error.util';

/**
 * Global fallback for anything that reaches the transport layer without
 * going through CommonService.handleErrors (guards, strategies, pipes,
 * or a service method that forgot its try/catch). Keeps the shape of
 * errors consistent for the GraphQLModule.formatError in app.module.ts,
 * which reads `extensions.originalError.statusCode`.
 */
@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown) {
    if (exception instanceof HttpException) {
      return exception;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return mapPrismaError(exception);
    }

    this.logger.error(exception);
    return new InternalServerErrorException('Internal Error');
  }
}
