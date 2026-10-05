import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

/**
 * API Gateway hanya memerlukan controller kecil (health check).
 * Routing sebenarnya ditangani http-proxy-middleware di main.ts.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
})
export class AppModule {}
