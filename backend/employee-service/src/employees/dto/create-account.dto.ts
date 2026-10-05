import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { UserRole } from '../../auth/interfaces/jwt-payload.interface';

/**
 * Body untuk POST /api/employees/:id/account.
 *
 * Dipakai tombol "Buat Akun" di halaman Data Karyawan. employee-service
 * meneruskan data ini ke auth-service (POST /api/auth/register), lalu
 * menyimpan users.id hasilnya ke employees.user_id.
 */
export class CreateAccountDto {
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
}
