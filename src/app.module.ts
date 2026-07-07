import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { OrganizationModule } from './organization/organization.module';
import { MenuModule } from './menu/menu.module';
import { RoleModule } from './role/role.module';
import { GraphQLFormattedError } from 'graphql';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { envValidationSchema } from './common/config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // rootValue: '/',
      path: '/gql',
      context: ({ req, res }) => ({ req, res }),
      plugins: [
        process.env.NODE_ENV === 'development'
          ? ApolloServerPluginLandingPageLocalDefault()
          : ApolloServerPluginLandingPageProductionDefault(),
      ],
      formatError: (formattedError: GraphQLFormattedError) => {
        const originalError = formattedError.extensions
          ?.originalError as any;

        if (originalError?.statusCode) {
          return {
            message: formattedError.message,
            extensions: {
              code: originalError.error?.toUpperCase() || 'BAD_REQUEST',
              statusCode: originalError.statusCode,
            },
          };
        }

        return formattedError;
      },
      // formatError: (err) => ({
      //   message: err.message,
      //   // status: err.extensions.code,
      //   // extensions: err.extensions,
      //   error: err.extensions.originalError['error'],
      //   code: err.extensions.originalError['statusCode'],
      //   originalMessage: err.extensions.originalError['message'],
      // }),
    }),
    UserModule,
    CommonModule,
    OrganizationModule,
    MenuModule,
    RoleModule,
    AuthModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
