/** Role yang dipakai aplikasi (sama dengan yang ada di auth-service). */
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HRD = 'HRD',
}

/**
 * Isi payload JWT dari auth-service.
 *
 * attendance-service tidak memakai Passport: token diverifikasi manual dengan
 * `jsonwebtoken` memakai JWT_SECRET yang sama (lihat JwtAuthGuard).
 * `employeeId` dipakai untuk mencatat absensi milik karyawan yang mana.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  iat?: number;
  exp?: number;
}
