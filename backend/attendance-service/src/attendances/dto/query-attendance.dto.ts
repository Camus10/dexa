import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { AttendanceStatus, WorkMode } from '../entities/attendance.entity';

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Query untuk GET /api/attendances (HRD) dan GET /api/attendances/me.
 * Pagination & filter dikerjakan server (bukan di frontend).
 */
export class QueryAttendanceDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'startDate harus format YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'endDate harus format YYYY-MM-DD' })
  endDate?: string;

  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional({ enum: WorkMode })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  /** Pencarian nama/NIK karyawan (dilengkapi dari employee-service). */
  @ApiPropertyOptional({ example: 'budi' })
  @IsOptional()
  @IsString()
  search?: string;
}
