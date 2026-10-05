import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AttendancesService } from './attendances.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { photoMulterOptions } from './storage/multer.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload, UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { RawResponse } from '../common/decorators/response-message.decorator';

/** Ambil token mentah dari request (diteruskan ke employee-service). */
function bearerToken(request: Request): string {
  return request.headers.authorization ?? '';
}

@ApiTags('Attendances')
@ApiBearerAuth()
@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post('check-in')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', photoMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Absen masuk dengan foto selfie + GPS (EMPLOYEE)' })
  @ResponseMessage('Absen masuk berhasil dicatat')
  checkIn(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckInDto,
    @Req() request: Request,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.attendancesService.checkIn(
      user.employeeId,
      bearerToken(request),
      dto,
      photo,
    );
  }

  @Post('check-out')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', photoMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Absen keluar (foto opsional) + hitung durasi' })
  @ResponseMessage('Absen keluar berhasil dicatat')
  checkOut(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckOutDto,
    @Req() request: Request,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.attendancesService.checkOut(
      user.employeeId,
      bearerToken(request),
      dto,
      photo,
    );
  }

  @Get('me')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Riwayat absensi sendiri (EMPLOYEE)' })
  @ResponseMessage('Riwayat absensi berhasil diambil')
  findMine(@CurrentUser() user: JwtPayload, @Query() query: QueryAttendanceDto) {
    return this.attendancesService.findMine(user.employeeId, query);
  }

  @Get('me/today')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Absensi hari ini milik sendiri (EMPLOYEE)' })
  @ResponseMessage('Absensi hari ini berhasil diambil')
  findToday(@CurrentUser() user: JwtPayload) {
    return this.attendancesService.findToday(user.employeeId);
  }

  @Get('me/calendar')
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Rekap absensi bulanan sendiri (EMPLOYEE)' })
  @ResponseMessage('Rekap bulanan berhasil diambil')
  getMonthly(
    @CurrentUser() user: JwtPayload,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    const fallback = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
    return this.attendancesService.getMonthlySummary(
      user.employeeId,
      month ?? fallback,
    );
  }

  @Get('summary')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Statistik absensi hari ini untuk dashboard (HRD)' })
  @ResponseMessage('Statistik absensi berhasil diambil')
  getSummary(@Req() request: Request) {
    return this.attendancesService.getSummary(bearerToken(request));
  }

  @Get('export')
  @Roles(UserRole.HRD)
  @RawResponse()
  @ApiOperation({ summary: 'Export laporan absensi ke CSV (HRD)' })
  async exportCsv(
    @Query() query: QueryAttendanceDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.attendancesService.exportCsv(
      query,
      bearerToken(request),
    );

    const fileName = `laporan-absensi-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    // @RawResponse() di atas membuat TransformInterceptor tidak membungkus
    // response, sehingga isi berkas CSV tetap utuh.
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    response.send(csv);
  }

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar seluruh absensi + filter (HRD)' })
  @ResponseMessage('Daftar absensi berhasil diambil')
  findAll(@Query() query: QueryAttendanceDto, @Req() request: Request) {
    return this.attendancesService.findAll(query, bearerToken(request));
  }

  @Get(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Detail absensi (HRD)' })
  @ResponseMessage('Detail absensi berhasil diambil')
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.attendancesService.findOne(id, bearerToken(request));
  }
}
