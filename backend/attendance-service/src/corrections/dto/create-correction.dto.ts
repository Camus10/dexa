import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Format jam 24 jam "HH:mm". */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Body untuk POST /api/corrections (EMPLOYEE).
 * Minimal salah satu dari jam masuk/keluar harus diisi - divalidasi di service
 * supaya pesan errornya jelas.
 */
export class CreateCorrectionDto {
  @ApiProperty({ example: '2026-02-03' })
  @Matches(DATE_PATTERN, { message: 'Tanggal harus format YYYY-MM-DD' })
  date: string;

  @ApiPropertyOptional({ example: '08:58' })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'Jam masuk harus format HH:mm' })
  requestedCheckIn?: string;

  @ApiPropertyOptional({ example: '17:05' })
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'Jam keluar harus format HH:mm' })
  requestedCheckOut?: string;

  @ApiProperty({ example: 'Lupa absen masuk karena HP mati' })
  @IsString({ message: 'Alasan wajib diisi' })
  @MinLength(5, { message: 'Alasan minimal 5 karakter' })
  @MaxLength(255, { message: 'Alasan maksimal 255 karakter' })
  reason: string;
}
