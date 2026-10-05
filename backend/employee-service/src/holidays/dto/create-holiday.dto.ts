import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Body untuk POST /api/holidays (HRD). */
export class CreateHolidayDto {
  @ApiProperty({ example: '2026-01-01' })
  @Matches(DATE_PATTERN, { message: 'Tanggal harus format YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: 'Tahun Baru Masehi' })
  @IsString({ message: 'Nama hari libur wajib diisi' })
  @MaxLength(100, { message: 'Nama hari libur maksimal 100 karakter' })
  name: string;
}
