import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Employee } from './entities/employee.entity';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { WorkShiftsModule } from '../work-shifts/work-shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    WorkShiftsModule,
    IntegrationsModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
