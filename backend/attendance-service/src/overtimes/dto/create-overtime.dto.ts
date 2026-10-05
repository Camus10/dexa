import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Format jam 24 jam "HH:mm". */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Body untuk POST /api/overtimes (EMPLOYEE). */
export class CreateOvertimeDto {
  @ApiProperty({ example: '2026-02-05' })
  @Matches(DATE_PATTERN, { message: 'Tanggal harus format YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: '18:00' })
  @Matches(TIME_PATTERN, { message: 'Jam mulai harus format HH:mm' })
  startTime: string;

  @ApiProperty({ example: '20:30' })
  @Matches(TIME_PATTERN, { message: 'Jam selesai harus format HH:mm' })
  endTime: string;

  @ApiProperty({ example: 'Menyelesaikan rilis fitur absensi' })
  @IsString({ message: 'Alasan wajib diisi' })
  @MinLength(5, { message: 'Alasan minimal 5 karakter' })
  @MaxLength(255, { message: 'Alasan maksimal 255 karakter' })
  reason: string;
}
