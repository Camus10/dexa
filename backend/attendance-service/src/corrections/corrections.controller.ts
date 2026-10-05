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

import { CorrectionsService } from './corrections.service';
import { CreateCorrectionDto } from './dto/create-correction.dto';
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

@ApiTags('Attendance Corrections')
@ApiBearerAuth()
@Controller('corrections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CorrectionsController {
  constructor(private readonly correctionsService: CorrectionsService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Ajukan koreksi absensi (EMPLOYEE)' })
  @ResponseMessage('Pengajuan koreksi berhasil dikirim')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCorrectionDto) {
    return this.correctionsService.create(user.employeeId, dto);
  }

  @Get('me')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Riwayat koreksi sendiri (EMPLOYEE)' })
  @ResponseMessage('Riwayat koreksi berhasil diambil')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.correctionsService.findMine(user.employeeId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Batalkan koreksi sendiri (EMPLOYEE)' })
  @ResponseMessage('Pengajuan koreksi berhasil dibatalkan')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.correctionsService.cancel(user.employeeId, id);
  }

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar semua koreksi absensi + nama karyawan (HRD)' })
  @ResponseMessage('Daftar koreksi berhasil diambil')
  findAll(@Query() query: QueryLeaveDto, @Req() request: Request) {
    return this.correctionsService.findAll(query, bearerToken(request));
  }

  @Patch(':id/review')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Setujui/tolak koreksi absensi (HRD)' })
  @ResponseMessage('Keputusan koreksi berhasil disimpan')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.correctionsService.review(id, dto, user.sub);
  }
}
