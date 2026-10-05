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

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementsService } from './announcements.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload, UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Pengumuman aktif sesuai role (semua role)' })
  @ResponseMessage('Daftar pengumuman berhasil diambil')
  findForMe(@CurrentUser() user: JwtPayload) {
    return this.announcementsService.findForRole(user.role);
  }

  @Get('admin')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Semua pengumuman termasuk nonaktif (HRD)' })
  @ResponseMessage('Daftar pengumuman berhasil diambil')
  findAllForAdmin() {
    return this.announcementsService.findAllForAdmin();
  }

  @Post()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Buat pengumuman (HRD)' })
  @ResponseMessage('Pengumuman berhasil dibuat')
  create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.announcementsService.create(dto, user?.sub ?? null);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Ubah pengumuman (HRD)' })
  @ResponseMessage('Pengumuman berhasil diperbarui')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Nonaktifkan pengumuman (HRD)' })
  @ResponseMessage('Pengumuman berhasil dinonaktifkan')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
