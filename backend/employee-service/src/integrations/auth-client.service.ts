import {
  BadGatewayException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { UserRole } from '../auth/interfaces/jwt-payload.interface';

export interface CreateAccountPayload {
  email: string;
  password: string;
  role: UserRole;
  employeeId: string;
}

/**
 * Komunikasi employee-service -> auth-service untuk membuat akun login.
 *
 * Dipakai fitur "Buat Akun" di halaman Data Karyawan: HRD mengisi email +
 * password, employee-service meneruskannya ke auth-service, lalu menyimpan
 * users.id yang dikembalikan ke kolom employees.user_id.
 *
 * Memakai `fetch` bawaan Node (tanpa library HTTP tambahan).
 */
@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  private get baseUrl(): string {
    return process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  }

  async createAccount(payload: CreateAccountPayload): Promise<{ id: string }> {
    const url = `${this.baseUrl}/api/auth/register`;

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error(`Gagal menghubungi auth-service di ${url}`);
      throw new BadGatewayException(
        'Tidak dapat menghubungi auth-service. Pastikan service tersebut berjalan.',
      );
    }

    const body = (await response.json().catch(() => null)) as {
      message?: string;
      data?: { id: string };
    } | null;

    if (!response.ok) {
      if (response.status === 409) {
        throw new ConflictException(
          body?.message ?? 'Email sudah terdaftar pada akun login',
        );
      }

      throw new HttpException(
        body?.message ?? 'Gagal membuat akun login',
        response.status,
      );
    }

    if (!body?.data?.id) {
      throw new BadGatewayException('Response auth-service tidak dikenali');
    }

    return body.data;
  }

  /**
   * Reset password akun login lewat auth-service (PATCH
   * /api/auth/users/:id/password).
   *
   * Endpoint tersebut hanya menerima HRD, karena itu header `authorization`
   * milik pemanggil (HRD yang sedang login) diteruskan apa adanya - token tidak
   * pernah dibuat ulang di sini.
   */
  async resetPassword(
    userId: string,
    password: string,
    authorization: string,
  ): Promise<{ id: string }> {
    const url = `${this.baseUrl}/api/auth/users/${userId}/password`;

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      this.logger.error(`Gagal menghubungi auth-service di ${url}`);
      throw new BadGatewayException(
        'Tidak dapat menghubungi auth-service. Pastikan service tersebut berjalan.',
      );
    }

    const body = (await response.json().catch(() => null)) as {
      message?: string;
      data?: { id: string };
    } | null;

    if (!response.ok) {
      throw new HttpException(
        body?.message ?? 'Gagal mengubah password akun login',
        response.status,
      );
    }

    if (!body?.data?.id) {
      throw new BadGatewayException('Response auth-service tidak dikenali');
    }

    return body.data;
  }
}
