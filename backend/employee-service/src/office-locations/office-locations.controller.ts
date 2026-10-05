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

import { CreateOfficeLocationDto } from './dto/create-office-location.dto';
import { UpdateOfficeLocationDto } from './dto/update-office-location.dto';
import { OfficeLocationsService } from './office-locations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Office Locations')
@ApiBearerAuth()
@Controller('office-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfficeLocationsController {
  constructor(
    private readonly officeLocationsService: OfficeLocationsService,
  ) {}

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar seluruh lokasi kantor (HRD)' })
  @ResponseMessage('Daftar lokasi kantor berhasil diambil')
  findAll() {
    return this.officeLocationsService.findAll(true);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lokasi kantor aktif untuk geofencing (semua role)' })
  @ResponseMessage('Daftar lokasi aktif berhasil diambil')
  findActive() {
    return this.officeLocationsService.findActive();
  }

  @Post()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Tambah lokasi kantor (HRD)' })
  @ResponseMessage('Lokasi kantor berhasil ditambahkan')
  create(@Body() dto: CreateOfficeLocationDto) {
    return this.officeLocationsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Ubah lokasi/radius kantor (HRD)' })
  @ResponseMessage('Lokasi kantor berhasil diperbarui')
  update(@Param('id') id: string, @Body() dto: UpdateOfficeLocationDto) {
    return this.officeLocationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Nonaktifkan lokasi kantor (HRD)' })
  @ResponseMessage('Lokasi kantor berhasil dinonaktifkan')
  remove(@Param('id') id: string) {
    return this.officeLocationsService.remove(id);
  }
}
