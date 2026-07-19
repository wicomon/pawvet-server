import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { PawvetLogger } from 'src/common/logger/pawvet.logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new PawvetLogger(),
  });
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

  const httpServer = app.getHttpServer();
  // Evita que conexiones keep-alive ociosas (p.ej. el playground de GraphQL)
  // bloqueen indefinidamente el drenaje de app.close() al recibir SIGTERM/SIGINT.
  httpServer.keepAliveTimeout = 5000;

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`Received ${signal}, shutting down...`);

    // Respaldo: si app.close() se cuelga (conexiones que no drenan), forzar salida.
    const forceExitTimer = setTimeout(() => {
      logger.warn('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 5000);
    forceExitTimer.unref();

    void app
      .close()
      .catch((err) => logger.error('Error during shutdown', err))
      .finally(() => {
        clearTimeout(forceExitTimer);
        process.exit(0);
      });

    // Node 18+: cierra a la fuerza los sockets keep-alive restantes.
    httpServer.closeAllConnections?.();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
bootstrap();
