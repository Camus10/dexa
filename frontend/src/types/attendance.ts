import type { BadgeColor } from "@/components/ui/badge/Badge";

/** Status absensi harian (sesuai enum di attendance-service). */
export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT"
  | "LEAVE"
  | "SICK"
  | "PERMIT";

/** Mode kerja saat absen. Hanya WFO yang divalidasi radius kantor. */
export type WorkMode = "WFO" | "WFH" | "WFA" | "FIELD";

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  workMode: WorkMode;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInPhotoUrl: string | null;
  checkOutPhotoUrl: string | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkInAddress: string | null;
  checkOutAddress: string | null;
  officeLocationId: string | null;
  officeLocationName: string | null;
  distanceMeters: number | null;
  withinGeofence: boolean | null;
  shiftId: string | null;
  shiftName: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workMinutes: number | null;
  status: AttendanceStatus;
  checkInNotes: string | null;
  checkOutNotes: string | null;

  /** Dilengkapi attendance-service dari employee-service (khusus HRD). */
  employeeName?: string | null;
  employeeNik?: string | null;
  employeeDepartment?: string | null;
}

/** Statistik ringkas untuk dashboard HRD. */
export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  present: number;
  late: number;
  onLeave: number;
  workFromHome: number;
  workFromOffice: number;
  outsideGeofence: number;
  pendingLeave: number;
  pendingOvertime: number;
  pendingCorrection: number;
}

/** Rekap bulanan milik sendiri (GET /attendances/me/calendar). */
export interface MonthlyRecap {
  month: string;
  days: Attendance[];
  present: number;
  late: number;
  totalWorkMinutes: number;
}

/** Bentuk response pagination yang dipakai DataTable. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Hadir",
  LATE: "Terlambat",
  ABSENT: "Alpha",
  LEAVE: "Cuti",
  SICK: "Sakit",
  PERMIT: "Izin",
};

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  WFO: "WFO (Kantor)",
  WFH: "WFH (Rumah)",
  WFA: "WFA (Luar Kota)",
  FIELD: "Kunjungan Lapangan",
};

/** Warna badge TailAdmin per status absensi. */
export const ATTENDANCE_STATUS_BADGE: Record<AttendanceStatus, BadgeColor> = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "error",
  LEAVE: "info",
  SICK: "info",
  PERMIT: "primary",
};

export const WORK_MODE_BADGE: Record<WorkMode, BadgeColor> = {
  WFO: "primary",
  WFH: "info",
  WFA: "warning",
  FIELD: "dark",
};
