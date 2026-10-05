import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { EmployeeStatus } from '../entities/employee.entity';

/** Format tanggal ISO "YYYY-MM-DD". */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Body untuk POST /api/employees (HRD).
 * NIK boleh mengandung huruf, angka, dan tanda hubung (contoh: DXA-0002).
 * Akun login TIDAK dibuat di sini - HRD memakai endpoint /:id/account.
 */
export class CreateEmployeeDto {
  @ApiProperty({ example: 'DXA-0004' })
  @IsString({ message: 'NIK wajib diisi' })
  @MaxLength(20, { message: 'NIK maksimal 20 karakter' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'NIK hanya boleh berisi huruf, angka, dan tanda hubung',
  })
  nik: string;

  @ApiProperty({ example: 'Andi Pratama' })
  @IsString({ message: 'Nama lengkap wajib diisi' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  fullName: string;

  @ApiPropertyOptional({ example: 'andi@dexa.co.id' })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({ example: 'Backend Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Posisi maksimal 50 karakter' })
  position?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Departemen maksimal 50 karakter' })
  department?: string;

  @ApiPropertyOptional({ example: '081200000004' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Telepon maksimal 20 karakter' })
  phone?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'Tanggal masuk harus format YYYY-MM-DD' })
  joinDate?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus, { message: 'Status harus ACTIVE atau INACTIVE' })
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 'accd7878-d6f1-4a85-ac44-8603336a8087' })
  @IsOptional()
  @IsUUID('4', { message: 'Shift harus UUID v4 yang valid' })
  shiftId?: string;
}
