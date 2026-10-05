import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Body untuk POST /api/office-locations (HRD). */
export class CreateOfficeLocationDto {
  @ApiProperty({ example: 'Kantor Pusat Jakarta' })
  @IsString({ message: 'Nama kantor wajib diisi' })
  @MaxLength(100, { message: 'Nama kantor maksimal 100 karakter' })
  name: string;

  @ApiPropertyOptional({ example: 'Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: -6.1836 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude harus berupa angka' })
  @Min(-90, { message: 'Latitude minimal -90' })
  @Max(90, { message: 'Latitude maksimal 90' })
  latitude: number;

  @ApiProperty({ example: 106.8325 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude harus berupa angka' })
  @Min(-180, { message: 'Longitude minimal -180' })
  @Max(180, { message: 'Longitude maksimal 180' })
  longitude: number;

  @ApiPropertyOptional({ example: 150, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Radius harus berupa angka meter' })
  @Min(10, { message: 'Radius minimal 10 meter' })
  @Max(5000, { message: 'Radius maksimal 5000 meter' })
  radiusMeters?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
