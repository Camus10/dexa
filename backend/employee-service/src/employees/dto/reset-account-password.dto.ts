import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Body untuk PATCH /api/employees/:id/account/password.
 *
 * Dipakai tombol "Ubah Password" di halaman Data Karyawan (HRD). HRD menetapkan
 * password baru tanpa perlu tahu password lama karyawan.
 */
export class ResetAccountPasswordDto {
  @ApiProperty({ example: 'passwordBaru123', minLength: 6 })
  @IsString({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  password: string;
}
