import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import type { SignOptions } from 'jsonwebtoken';

@Module({
  providers: [AuthResolver, AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          // JWT_EXPIRATION es la única fuente de verdad del tiempo de vida
          // del token (ver env.validation.ts). El cast es necesario porque
          // `expiresIn` exige un template literal type (`ms.StringValue`)
          // que un env var (string genérico validado en runtime por Joi) no
          // satisface estáticamente.
          expiresIn: configService.get<string>(
            'JWT_EXPIRATION',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
})
export class AuthModule {}
