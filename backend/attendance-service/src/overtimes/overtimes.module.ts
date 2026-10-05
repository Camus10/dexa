import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OvertimeRequest } from './entities/overtime-request.entity';
import { OvertimesController } from './overtimes.controller';
import { OvertimesService } from './overtimes.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OvertimeRequest]),
    AuditLogsModule,
    // Diperlukan untuk melengkapi nama/NIK karyawan pada daftar pengajuan HRD.
    IntegrationsModule,
  ],
  controllers: [OvertimesController],
  providers: [OvertimesService],
  exports: [OvertimesService],
})
export class OvertimesModule {}
