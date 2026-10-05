import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Body untuk PATCH /api/auth/password.
 *
 * Dipakai halaman Profil karyawan (dan HRD) untuk mengganti password akun
 * miliknya sendiri. Password lama wajib diisi sebagai bukti kepemilikan.
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'Password saat ini wajib diisi' })
  currentPassword: string;

  @ApiProperty({ example: 'passwordBaru123', minLength: 6 })
  @IsString({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}
