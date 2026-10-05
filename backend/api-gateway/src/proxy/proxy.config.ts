/**
 * Konfigurasi rute proxy API Gateway.
 *
 * Gateway tidak menyimpan business logic apa pun: setiap prefix di bawah ini
 * hanya diteruskan apa adanya (termasuk multipart upload foto absensi) ke
 * service pemiliknya. Karena gateway memakai `app.use()` tanpa path,
 * prefix TIDAK dipotong sebelum diteruskan - service tujuan memang
 * memakai global prefix `api` yang sama.
 */

export interface ServiceRoute {
  /** Nama service (dipakai untuk log). */
  name: string;
  /** Base URL service, dibaca dari env dengan fallback berikut. */
  target: string;
  /** Prefix path yang menjadi tanggung jawab service ini. */
  prefixes: string[];
}

const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
const EMPLOYEE_URL = process.env.EMPLOYEE_SERVICE_URL ?? 'http://localhost:3002';
const ATTENDANCE_URL = process.env.ATTENDANCE_SERVICE_URL ?? 'http://localhost:3003';

export const SERVICE_ROUTES: ServiceRoute[] = [
  {
    name: 'auth-service',
    target: AUTH_URL,
    prefixes: ['/api/auth'],
  },
  {
    name: 'employee-service',
    target: EMPLOYEE_URL,
    prefixes: [
      '/api/employees',
      '/api/work-shifts',
      '/api/office-locations',
      '/api/holidays',
      '/api/announcements',
    ],
  },
  {
    name: 'attendance-service',
    target: ATTENDANCE_URL,
    prefixes: [
      '/api/attendances',
      '/api/leaves',
      '/api/overtimes',
      '/api/corrections',
      '/api/audit-logs',
    ],
  },
];

/** Foto absensi diserve attendance-service, tetapi diakses lewat gateway. */
export const UPLOADS_ROUTE: ServiceRoute = {
  name: 'attendance-service (uploads)',
  target: ATTENDANCE_URL,
  prefixes: ['/uploads'],
};

/** Daftar seluruh prefix yang diteruskan gateway (untuk log saat start). */
export const ALL_PREFIXES: string[] = [
  ...SERVICE_ROUTES.flatMap((route) => route.prefixes),
  ...UPLOADS_ROUTE.prefixes,
];

/**
 * Ubah daftar prefix menjadi pathFilter http-proxy-middleware.
 * Contoh: "/api/auth" menjadi "/api/auth/**".
 */
export function toPathFilter(prefixes: string[]): string[] {
  return prefixes.map((prefix) => `${prefix.replace(/\/$/, '')}/**`);
}
