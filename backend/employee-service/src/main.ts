import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('EmployeeService');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // Query string selalu berupa string, jadi konversi tipe perlu diaktifkan.
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Employee Service - Aplikasi Absensi Dexa')
    .setDescription(
      'Master karyawan, shift kerja, lokasi kantor (geofencing), hari libur, dan pengumuman.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
  logger.log(`Employee Service berjalan di http://localhost:${port}/api`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
