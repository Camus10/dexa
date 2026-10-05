import { UserRole } from '../../users/entities/user.entity';

/**
 * Isi payload JWT yang ditandatangani auth-service dan diverifikasi
 * service lain memakai JWT_SECRET yang sama.
 *
 * `sub` = users.id, `employeeId` = relasi ke db_employee.employees.id
 * (dipakai attendance-service untuk mencatat absensi milik siapa).
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  iat?: number;
  exp?: number;
}
