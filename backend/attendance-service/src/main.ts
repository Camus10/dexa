import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('AttendanceService');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  // Foto absensi diserve statis dan diakses lewat gateway:
  // http://localhost:3000/uploads/<nama-file>
  app.useStaticAssets(join(process.cwd(), process.env.UPLOAD_DIR ?? './uploads'), {
    prefix: '/uploads/',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Attendance Service - Aplikasi Absensi Dexa')
    .setDescription(
      'Absensi (selfie + GPS + geofence), cuti/izin, lembur, koreksi absensi, dan jejak audit.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);
  logger.log(`Attendance Service berjalan di http://localhost:${port}/api`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`Foto absensi: http://localhost:${port}/uploads/<nama-file>`);
}

void bootstrap();
