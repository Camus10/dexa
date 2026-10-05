/** Role aplikasi (sesuai JWT dari auth-service). */
export type UserRole = "EMPLOYEE" | "HRD";

/** Data user yang disimpan di store setelah login. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  HRD: "HRD",
  EMPLOYEE: "Karyawan",
};

/** Prefix path per role: /admin untuk HRD, /app untuk karyawan. */
export const ROLE_AREA_PREFIX: Record<UserRole, string> = {
  HRD: "/admin",
  EMPLOYEE: "/app",
};

/** Halaman awal setelah login, sesuai role. */
export function roleHomePath(role: UserRole): string {
  return role === "HRD" ? "/admin/dashboard" : "/app/home";
}

export function isHrd(role: UserRole | undefined | null): boolean {
  return role === "HRD";
}

/** Cek apakah sebuah path termasuk area role tertentu. */
export function isPathForRole(path: string, role: UserRole): boolean {
  return path.startsWith(ROLE_AREA_PREFIX[role]);
}
