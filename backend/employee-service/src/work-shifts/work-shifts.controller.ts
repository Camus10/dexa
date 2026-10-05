import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';
import { WorkShiftsService } from './work-shifts.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Work Shifts')
@ApiBearerAuth()
@Controller('work-shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkShiftsController {
  constructor(private readonly workShiftsService: WorkShiftsService) {}

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar seluruh shift (HRD)' })
  @ResponseMessage('Daftar shift berhasil diambil')
  findAll() {
    return this.workShiftsService.findAll(true);
  }

  @Get('active')
  @ApiOperation({ summary: 'Daftar shift aktif (semua role)' })
  @ResponseMessage('Daftar shift aktif berhasil diambil')
  findAllActive() {
    return this.workShiftsService.findAll(false);
  }

  @Post()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Tambah shift (HRD)' })
  @ResponseMessage('Shift kerja berhasil ditambahkan')
  create(@Body() dto: CreateWorkShiftDto) {
    return this.workShiftsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Ubah shift (HRD)' })
  @ResponseMessage('Shift kerja berhasil diperbarui')
  update(@Param('id') id: string, @Body() dto: UpdateWorkShiftDto) {
    return this.workShiftsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Nonaktifkan shift (HRD)' })
  @ResponseMessage('Shift kerja berhasil dinonaktifkan')
  remove(@Param('id') id: string) {
    return this.workShiftsService.remove(id);
  }
}
