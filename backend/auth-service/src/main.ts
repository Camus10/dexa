import { Logger, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('AuthService');
  const app = await NestFactory.create(AppModule);

  // Seluruh route berada di bawah /api agar konsisten saat diproksi gateway.
  app.setGlobalPrefix('api');

  // whitelist: properti yang tidak ada di DTO dibuang,
  // transform: tipe data dikonversi sesuai DTO (berguna untuk query params).
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Service - Aplikasi Absensi Dexa')
    .setDescription(
      'Register, login (JWT), dan profil user. Password di-hash dengan Argon2id.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  logger.log(`Auth Service berjalan di http://localhost:${port}/api`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
