import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const acceptedUrls = process.env.ACCEPTED_URLS?.split(', ') ?? [];

  const fullHelmet = helmet();
  const helmetWithoutCsp = helmet({ contentSecurityPolicy: false });
  app.use((req, res, next) => {
    const isGqlPlayground = req.method === 'GET' && req.path === '/gql';
    return isGqlPlayground
      ? helmetWithoutCsp(req, res, next)
      : fullHelmet(req, res, next);
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: acceptedUrls,
  });

  app.enableShutdownHooks();

  const PORT = process.env.PORT || '4030';
  await app.listen(PORT);
  logger.log(`App running on port ${PORT}`);
}
bootstrap();
