import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AttendanceCorrection } from '../corrections/entities/attendance-correction.entity';
import { IntegrationsModule } from '../integrations/integrations.module';
import { LeaveRequest } from '../leaves/entities/leave-request.entity';
import { OvertimeRequest } from '../overtimes/entities/overtime-request.entity';

@Module({
  imports: [
    // LeaveRequest/OvertimeRequest/AttendanceCorrection ikut didaftarkan
    // karena endpoint /summary menghitung jumlah pengajuan yang menunggu.
    TypeOrmModule.forFeature([
      Attendance,
      LeaveRequest,
      OvertimeRequest,
      AttendanceCorrection,
    ]),
    IntegrationsModule,
    AuditLogsModule,
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
