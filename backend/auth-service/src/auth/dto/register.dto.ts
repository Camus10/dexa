import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import { UserRole } from '../../users/entities/user.entity';

/**
 * Body untuk POST /api/auth/register.
 * Dipakai juga oleh employee-service saat HRD menekan "Buat Akun"
 * (inter-service), sehingga `employeeId` opsional diisi.
 */
export class RegisterDto {
  @ApiProperty({ example: 'andi@dexa.co.id' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.EMPLOYEE })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role harus EMPLOYEE atau HRD' })
  role?: UserRole;

  @ApiPropertyOptional({ example: 'a87f6074-210a-4ffe-946c-00c32be085b6' })
  @IsOptional()
  @IsUUID('4', { message: 'employeeId harus UUID v4 yang valid' })
  employeeId?: string;
}
