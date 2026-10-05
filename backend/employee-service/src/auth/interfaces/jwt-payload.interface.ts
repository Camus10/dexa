/** Role yang dipakai aplikasi (sama dengan yang ada di auth-service). */
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HRD = 'HRD',
}

/**
 * Isi payload JWT dari auth-service.
 *
 * employee-service tidak memakai Passport: token diverifikasi manual dengan
 * `jsonwebtoken` memakai JWT_SECRET yang sama (lihat JwtAuthGuard).
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  iat?: number;
  exp?: number;
}
