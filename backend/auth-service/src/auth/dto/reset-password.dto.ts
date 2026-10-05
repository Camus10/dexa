import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Body untuk PATCH /api/auth/users/:id/password.
 *
 * Hanya boleh dipanggil HRD. employee-service memakai endpoint ini saat HRD
 * menekan "Ubah Password" di halaman Data Karyawan (token HRD diteruskan).
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'passwordBaru123', minLength: 6 })
  @IsString({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  password: string;
}
