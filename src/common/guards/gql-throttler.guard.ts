import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

interface GqlHttpContext {
  req: Record<string, unknown>;
  res: Record<string, unknown>;
}

/**
 * ThrottlerGuard reads the request/response off the HTTP execution context
 * by default, which is empty for GraphQL resolvers. Same adaptation pattern
 * as JwtAuthGuard (src/auth/guards/jwt-auth.guard.ts).
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx =
      GqlExecutionContext.create(context).getContext<GqlHttpContext>();
    return { req: gqlCtx.req, res: gqlCtx.res };
  }
}
