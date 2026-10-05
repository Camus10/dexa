/** Master shift kerja (db_employee.work_shifts). */
export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateToleranceMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkShiftInput {
  name: string;
  startTime: string;
  endTime: string;
  lateToleranceMinutes?: number;
  isActive?: boolean;
}

/** Titik kantor + radius geofencing. */
export interface OfficeLocation {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeLocationInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  isActive?: boolean;
}

/** Hari libur nasional/perusahaan. */
export interface Holiday {
  id: string;
  date: string;
  name: string;
  createdAt: string;
}

export interface HolidayInput {
  date: string;
  name: string;
}

export type AnnouncementAudience = "ALL" | "EMPLOYEE" | "HRD";

/** Pengumuman dari HRD. */
export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  audience?: AnnouncementAudience;
  isActive?: boolean;
}

export const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  ALL: "Semua",
  EMPLOYEE: "Karyawan",
  HRD: "HRD",
};
