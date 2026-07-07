import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import graphqlFields from 'graphql-fields';
import { PrismaSelect } from 'src/common/types/prisma-select.type';

export const SelectFields = createParamDecorator(
  (data: unknown, context: ExecutionContext): PrismaSelect => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const fields = graphqlFields(info);

    function createPrismaSelect(
      fieldsObject: Record<string, any>,
    ): PrismaSelect {
      return Object.entries(fieldsObject).reduce((acc, [key, value]) => {
        if (key === '__typename') {
          return acc;
        }
        if (
          value &&
          typeof value === 'object' &&
          Object.keys(value).length > 0
        ) {
          acc[key] = {
            select: createPrismaSelect(value),
          };
        } else {
          acc[key] = true;
        }
        return acc;
      }, {});
    }

    const prismaSelect = createPrismaSelect(fields);
    return prismaSelect;
  },
);
