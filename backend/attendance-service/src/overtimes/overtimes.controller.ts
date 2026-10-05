import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { OvertimesService } from './overtimes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload, UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ReviewRequestDto } from '../common/dto/review-request.dto';
import { QueryLeaveDto } from '../leaves/dto/query-leave.dto';

/** Ambil token mentah dari request (diteruskan ke employee-service). */
function bearerToken(request: Request): string {
  return request.headers.authorization ?? '';
}

@ApiTags('Overtimes')
@ApiBearerAuth()
@Controller('overtimes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OvertimesController {
  constructor(private readonly overtimesService: OvertimesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Ajukan lembur (EMPLOYEE)' })
  @ResponseMessage('Pengajuan lembur berhasil dikirim')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOvertimeDto) {
    return this.overtimesService.create(user.employeeId, dto);
  }

  @Get('me')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Riwayat pengajuan lembur sendiri (EMPLOYEE)' })
  @ResponseMessage('Riwayat lembur berhasil diambil')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.overtimesService.findMine(user.employeeId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Batalkan pengajuan lembur sendiri (EMPLOYEE)' })
  @ResponseMessage('Pengajuan lembur berhasil dibatalkan')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.overtimesService.cancel(user.employeeId, id);
  }

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar semua pengajuan lembur + nama karyawan (HRD)' })
  @ResponseMessage('Daftar pengajuan lembur berhasil diambil')
  findAll(@Query() query: QueryLeaveDto, @Req() request: Request) {
    return this.overtimesService.findAll(query, bearerToken(request));
  }

  @Patch(':id/review')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Setujui/tolak pengajuan lembur (HRD)' })
  @ResponseMessage('Keputusan lembur berhasil disimpan')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.overtimesService.review(id, dto, user.sub);
  }
}
