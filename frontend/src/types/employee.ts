import type { BadgeColor } from "@/components/ui/badge/Badge";
import type { UserRole } from "@/lib/auth";

import type { WorkShift } from "./master";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface Employee {
  id: string;
  userId: string | null;
  email: string | null;
  nik: string;
  fullName: string;
  position: string | null;
  department: string | null;
  phone: string | null;
  photoUrl: string | null;
  joinDate: string | null;
  status: EmployeeStatus;
  shiftId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Karyawan + shift-nya (dipakai Beranda karyawan dan tabel HRD). */
export interface EmployeeWithShift extends Employee {
  shift: WorkShift | null;
}

export interface CreateEmployeeInput {
  nik: string;
  fullName: string;
  email?: string;
  position?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
  status?: EmployeeStatus;
  shiftId?: string;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

export interface CreateAccountInput {
  email: string;
  password: string;
  /**
   * Role akun login. Default EMPLOYEE di employee-service; HRD dapat membuat
   * akun HRD lain bila memang diperlukan.
   */
  role?: UserRole;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
};

export const EMPLOYEE_STATUS_BADGE: Record<EmployeeStatus, BadgeColor> = {
  ACTIVE: "success",
  INACTIVE: "light",
};

/** Daftar departemen yang dipakai pada dropdown filter/pencarian. */
export const DEPARTMENTS = [
  "Human Resource",
  "Engineering",
  "Product",
  "Finance",
  "Marketing",
  "Operations",
];
