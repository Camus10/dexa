import type { BadgeColor } from "@/components/ui/badge/Badge";

export type LeaveType = "ANNUAL" | "SICK" | "PERMIT" | "UNPAID";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

/** Pengajuan cuti/izin/sakit. */
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  attachmentUrl: string | null;
  status: RequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

/** Pengajuan lembur. */
export interface OvertimeRequest {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: RequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

/** Pengajuan koreksi absensi. */
export interface CorrectionRequest {
  id: string;
  employeeId: string;
  date: string;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
  reason: string;
  status: RequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
}

/** Data karyawan yang ditempelkan pada daftar pengajuan (HRD). */
export interface RequestWithEmployee {
  employeeName?: string | null;
  employeeNik?: string | null;
}

export interface LeaveBalance {
  quota: number;
  used: number;
  remaining: number;
}

export interface CreateLeaveInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface CreateOvertimeInput {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface CreateCorrectionInput {
  date: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
}

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  ANNUAL: "Cuti Tahunan",
  SICK: "Sakit",
  PERMIT: "Izin",
  UNPAID: "Cuti Tanpa Gaji",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export const REQUEST_STATUS_BADGE: Record<RequestStatus, BadgeColor> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "light",
};
