import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
  //! Override
  getRequest(context: ExecutionContext) {
    // console.log(context)
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // console.log('jwt-guard-----------------------------------')
    // console.log(ctx)
    // console.log('guard')
    return request;
  }
}
