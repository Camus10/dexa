import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkShift } from './entities/work-shift.entity';
import { WorkShiftsController } from './work-shifts.controller';
import { WorkShiftsService } from './work-shifts.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkShift])],
  controllers: [WorkShiftsController],
  providers: [WorkShiftsService],
  exports: [WorkShiftsService],
})
export class WorkShiftsModule {}
