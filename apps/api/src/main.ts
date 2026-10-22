import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initialisePlatformRegistries } from './platform/initialise-platform-registries';

async function bootstrap() {
  initialisePlatformRegistries();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.WEB_APP_URL ?? 'http://localhost:3001',
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
