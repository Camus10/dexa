import { Module } from '@nestjs/common';

import { EmployeeClientService } from './employee-client.service';

/**
 * Modul integrasi attendance-service ke employee-service
 * (shift, data karyawan, dan lokasi kantor untuk geofencing).
 */
@Module({
  providers: [EmployeeClientService],
  exports: [EmployeeClientService],
})
export class IntegrationsModule {}
