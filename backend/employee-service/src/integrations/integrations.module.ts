import { Module } from '@nestjs/common';

import { AuthClientService } from './auth-client.service';

/**
 * Modul integrasi ke service lain. Saat ini hanya AuthClientService
 * (membuat akun login lewat auth-service).
 */
@Module({
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class IntegrationsModule {}
