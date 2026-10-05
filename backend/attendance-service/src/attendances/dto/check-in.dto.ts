import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { WorkMode } from '../entities/attendance.entity';

/**
 * Body untuk POST /api/attendances/check-in.
 *
 * Dikirim sebagai multipart/form-data (ada file selfie), sehingga semua field
 * datang sebagai string - karena itu angka dikonversi dengan @Type(() => Number).
 * Waktu absen TIDAK dikirim dari frontend: selalu diambil dari jam server.
 */
export class CheckInDto {
  @ApiProperty({ enum: WorkMode, example: WorkMode.WFO })
  @IsEnum(WorkMode, { message: 'Mode kerja harus WFO, WFH, WFA, atau FIELD' })
  workMode: WorkMode;

  @ApiPropertyOptional({ example: -6.1836 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude harus berupa angka' })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 106.8325 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude harus berupa angka' })
  @Min(-180)
  @Max(180)
  longitude?: number;

  /** Alamat hasil reverse-geocoding di frontend (opsional, hanya untuk audit). */
  @ApiPropertyOptional({ example: 'Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Masuk tepat waktu' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
