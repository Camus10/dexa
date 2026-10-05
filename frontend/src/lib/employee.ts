import type { EmployeeStatus } from "@/types/employee";

/** Inisial nama untuk avatar, mis. "Budi Santoso" menjadi "BS". */
export function employeeInitials(name: string | null | undefined): string {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Opsi filter status karyawan untuk dropdown. */
export const EMPLOYEE_STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] =
  [
    { value: "ACTIVE", label: "Aktif" },
    { value: "INACTIVE", label: "Nonaktif" },
  ];

/** Ringkas nama departemen untuk ditampilkan (null menjadi "-"). */
export function departmentLabel(department: string | null | undefined): string {
  return department && department.trim() ? department : "-";
}
