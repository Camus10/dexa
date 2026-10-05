import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeaveRequest } from './entities/leave-request.entity';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest]),
    AuditLogsModule,
    // Diperlukan untuk melengkapi nama/NIK karyawan pada daftar pengajuan HRD.
    IntegrationsModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
