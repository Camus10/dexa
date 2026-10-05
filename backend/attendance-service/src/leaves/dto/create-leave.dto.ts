import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { LeaveType } from '../entities/leave-request.entity';

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Body untuk POST /api/leaves (EMPLOYEE). */
export class CreateLeaveDto {
  @ApiProperty({ enum: LeaveType, example: LeaveType.ANNUAL })
  @IsEnum(LeaveType, {
    message: 'Jenis pengajuan harus ANNUAL, SICK, PERMIT, atau UNPAID',
  })
  type: LeaveType;

  @ApiProperty({ example: '2026-03-01' })
  @Matches(DATE_PATTERN, { message: 'Tanggal mulai harus format YYYY-MM-DD' })
  startDate: string;

  @ApiProperty({ example: '2026-03-02' })
  @Matches(DATE_PATTERN, { message: 'Tanggal selesai harus format YYYY-MM-DD' })
  endDate: string;

  @ApiProperty({ example: 'Acara keluarga di luar kota' })
  @IsString({ message: 'Alasan wajib diisi' })
  @MinLength(5, { message: 'Alasan minimal 5 karakter' })
  @MaxLength(255, { message: 'Alasan maksimal 255 karakter' })
  reason: string;

  @ApiPropertyOptional({ example: '/uploads/surat-dokter.jpg' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
