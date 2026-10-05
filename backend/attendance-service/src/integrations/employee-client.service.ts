import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export interface ShiftSummary {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateToleranceMinutes: number;
  isActive: boolean;
}

export interface EmployeeSummary {
  id: string;
  nik: string;
  fullName: string;
  email: string | null;
  position: string | null;
  department: string | null;
  status: string;
  shift: ShiftSummary | null;
}

export interface OfficeLocationSummary {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

/**
 * Komunikasi attendance-service -> employee-service.
 *
 * Dipakai untuk:
 * - mengambil shift & nama karyawan (perhitungan telat + snapshot absensi),
 * - mengambil daftar kantor aktif (validasi geofencing),
 * - melengkapi nama karyawan pada laporan/export CSV.
 *
 * Token dari request diteruskan (forward) supaya aturan role di
 * employee-service tetap berlaku - tidak ada bypass autentikasi.
 */
@Injectable()
export class EmployeeClientService {
  private readonly logger = new Logger(EmployeeClientService.name);

  private get baseUrl(): string {
    return process.env.EMPLOYEE_SERVICE_URL ?? 'http://localhost:3002';
  }

  /** GET /api/employees/me - data karyawan pemilik token (mode EMPLOYEE). */
  async getMyProfile(token: string): Promise<EmployeeSummary> {
    return this.request<EmployeeSummary>('/api/employees/me', token);
  }

  /** GET /api/employees/all - seluruh karyawan (butuh token HRD). */
  async getEmployees(token: string): Promise<EmployeeSummary[]> {
    return this.request<EmployeeSummary[]>('/api/employees/all', token);
  }

  /** GET /api/employees/:id - detail karyawan (butuh token HRD). */
  async getEmployeeById(id: string, token: string): Promise<EmployeeSummary> {
    return this.request<EmployeeSummary>(`/api/employees/${id}`, token);
  }

  /** GET /api/office-locations/active - daftar kantor untuk geofencing. */
  getActiveOfficeLocations(token: string): Promise<OfficeLocationSummary[]> {
    return this.request<OfficeLocationSummary[]>(
      '/api/office-locations/active',
      token,
    );
  }

  private async request<T>(path: string, token: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
      });
    } catch {
      this.logger.error(`Gagal menghubungi employee-service: ${url}`);
      throw new BadGatewayException(
        'Tidak dapat menghubungi employee-service. Pastikan service tersebut berjalan.',
      );
    }

    const body = (await response.json().catch(() => null)) as {
      message?: string;
      data?: T;
    } | null;

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException(
          body?.message ?? 'Data karyawan tidak ditemukan di employee-service',
        );
      }

      throw new BadGatewayException(
        body?.message ?? 'Gagal mengambil data dari employee-service',
      );
    }

    return body?.data as T;
  }
}
