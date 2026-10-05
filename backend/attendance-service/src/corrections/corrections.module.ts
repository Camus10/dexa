import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CorrectionsController } from './corrections.controller';
import { CorrectionsService } from './corrections.service';
import { AttendanceCorrection } from './entities/attendance-correction.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    // Attendance diikutkan karena persetujuan koreksi memperbarui jam absensi.
    TypeOrmModule.forFeature([AttendanceCorrection, Attendance]),
    AuditLogsModule,
    // Diperlukan untuk melengkapi nama/NIK karyawan pada daftar koreksi HRD.
    IntegrationsModule,
  ],
  controllers: [CorrectionsController],
  providers: [CorrectionsService],
  exports: [CorrectionsService],
})
export class CorrectionsModule {}
