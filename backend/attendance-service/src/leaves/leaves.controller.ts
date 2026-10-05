import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { CreateLeaveDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import { LeavesService } from './leaves.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload, UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ReviewRequestDto } from '../common/dto/review-request.dto';

/** Ambil token mentah dari request (diteruskan ke employee-service). */
function bearerToken(request: Request): string {
  return request.headers.authorization ?? '';
}

@ApiTags('Leaves')
@ApiBearerAuth()
@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Ajukan cuti/izin/sakit (EMPLOYEE)' })
  @ResponseMessage('Pengajuan berhasil dikirim')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeaveDto) {
    return this.leavesService.create(user.employeeId, dto);
  }

  @Get('me')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Riwayat pengajuan sendiri (EMPLOYEE)' })
  @ResponseMessage('Riwayat pengajuan berhasil diambil')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.leavesService.findMine(user.employeeId);
  }

  @Get('balance/me')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Saldo cuti tahunan sendiri (EMPLOYEE)' })
  @ResponseMessage('Saldo cuti berhasil diambil')
  getBalance(@CurrentUser() user: JwtPayload) {
    return this.leavesService.getBalance(user.employeeId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Batalkan pengajuan sendiri (EMPLOYEE)' })
  @ResponseMessage('Pengajuan berhasil dibatalkan')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leavesService.cancel(user.employeeId, id);
  }

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Semua pengajuan cuti/izin + filter + nama karyawan (HRD)' })
  @ResponseMessage('Daftar pengajuan berhasil diambil')
  findAll(@Query() query: QueryLeaveDto, @Req() request: Request) {
    return this.leavesService.findAll(query, bearerToken(request));
  }

  @Patch(':id/review')
  @Roles(UserRole.HRD)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setujui/tolak pengajuan (HRD)' })
  @ResponseMessage('Keputusan berhasil disimpan')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leavesService.review(id, dto, user.sub);
  }
}
