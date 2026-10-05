import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Format jam 24 jam "HH:mm", mis. 09:00 atau 18:00. */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Body untuk POST /api/work-shifts (HRD). */
export class CreateWorkShiftDto {
  @ApiProperty({ example: 'Reguler (09:00 - 18:00)' })
  @IsString({ message: 'Nama shift wajib diisi' })
  @MaxLength(50, { message: 'Nama shift maksimal 50 karakter' })
  name: string;

  @ApiProperty({ example: '09:00' })
  @Matches(TIME_PATTERN, { message: 'Jam masuk harus format HH:mm' })
  startTime: string;

  @ApiProperty({ example: '18:00' })
  @Matches(TIME_PATTERN, { message: 'Jam keluar harus format HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ example: 15, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Toleransi harus berupa angka menit' })
  @Min(0, { message: 'Toleransi tidak boleh negatif' })
  @Max(180, { message: 'Toleransi maksimal 180 menit' })
  lateToleranceMinutes?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
