import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Body untuk POST /api/attendances/check-out.
 *
 * Foto keluar OPSIONAL (sesuai README), jadi endpoint ini menerima
 * multipart/form-data dengan file yang boleh kosong.
 */
export class CheckOutDto {
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

  @ApiPropertyOptional({ example: 'Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Selesai WFH' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
