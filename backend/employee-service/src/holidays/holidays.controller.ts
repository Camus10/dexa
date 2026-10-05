import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidaysService } from './holidays.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Holidays')
@ApiBearerAuth()
@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar hari libur (semua role)' })
  @ApiQuery({ name: 'from', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-12-31' })
  @ResponseMessage('Daftar hari libur berhasil diambil')
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.holidaysService.findAll(from, to);
  }

  @Post()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Tambah hari libur (HRD)' })
  @ResponseMessage('Hari libur berhasil ditambahkan')
  create(@Body() dto: CreateHolidayDto) {
    return this.holidaysService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Ubah hari libur (HRD)' })
  @ResponseMessage('Hari libur berhasil diperbarui')
  update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.holidaysService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Hapus hari libur (HRD)' })
  @ResponseMessage('Hari libur berhasil dihapus')
  remove(@Param('id') id: string) {
    return this.holidaysService.remove(id);
  }
}
