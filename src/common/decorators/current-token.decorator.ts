import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentToken = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    // Convertir el contexto HTTP a contexto GraphQL
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Intentar obtener el token del header Authorization
    const authHeader = request.headers?.authorization;
    // console.log({ authHeader });

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remover "Bearer "
    }

    // Si no está en el header, intentar obtenerlo de los args de GraphQL
    const args = ctx.getArgs();
    const token = args.token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    return token;
  },
);
