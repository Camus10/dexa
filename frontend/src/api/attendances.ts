import { api, unwrap, type ApiSuccessResponse } from "@/lib/axios";
import type {
  Attendance,
  AttendanceSummary,
  MonthlyRecap,
  PaginatedResponse,
  WorkMode,
} from "@/types/attendance";

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  workMode?: WorkMode;
  employeeId?: string;
  search?: string;
}

export interface CheckInInput {
  workMode: WorkMode;
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
  photo: File;
}

export interface CheckOutInput {
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
  photo?: File | null;
}

/** Susun FormData untuk absen (multipart, karena ada file selfie). */
function toFormData(input: CheckInInput | CheckOutInput): FormData {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    formData.append(key, value as string | Blob);
  });

  return formData;
}

/** POST /api/attendances/check-in - absen masuk (selfie + GPS). */
export async function checkIn(input: CheckInInput): Promise<Attendance> {
  const response = await api.post<ApiSuccessResponse<Attendance>>(
    "/attendances/check-in",
    toFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return unwrap(response);
}

/** POST /api/attendances/check-out - absen keluar (foto opsional). */
export async function checkOut(input: CheckOutInput): Promise<Attendance> {
  const response = await api.post<ApiSuccessResponse<Attendance>>(
    "/attendances/check-out",
    toFormData(input),
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return unwrap(response);
}

/** GET /api/attendances/me - riwayat absensi sendiri. */
export async function fetchMyAttendances(
  query: AttendanceQuery,
): Promise<PaginatedResponse<Attendance>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<Attendance>>
  >("/attendances/me", { params: query });

  return unwrap(response);
}

/** GET /api/attendances/me/today - absensi hari ini (null bila belum absen). */
export async function fetchTodayAttendance(): Promise<Attendance | null> {
  const response =
    await api.get<ApiSuccessResponse<Attendance | null>>(
      "/attendances/me/today",
    );

  return response.data.data;
}

/** GET /api/attendances/me/calendar?month=YYYY-MM - rekap bulanan. */
export async function fetchMonthlyRecap(month: string): Promise<MonthlyRecap> {
  const response = await api.get<ApiSuccessResponse<MonthlyRecap>>(
    "/attendances/me/calendar",
    { params: { month } },
  );

  return unwrap(response);
}

/** GET /api/attendances/summary - statistik dashboard HRD. */
export async function fetchAttendanceSummary(): Promise<AttendanceSummary> {
  const response =
    await api.get<ApiSuccessResponse<AttendanceSummary>>(
      "/attendances/summary",
    );

  return unwrap(response);
}

/** GET /api/attendances - daftar seluruh absensi (HRD). */
export async function fetchAttendances(
  query: AttendanceQuery,
): Promise<PaginatedResponse<Attendance>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<Attendance>>
  >("/attendances", { params: query });

  return unwrap(response);
}

/** GET /api/attendances/:id - detail absensi (HRD). */
export async function fetchAttendanceDetail(id: string): Promise<Attendance> {
  const response = await api.get<ApiSuccessResponse<Attendance>>(
    `/attendances/${id}`,
  );

  return unwrap(response);
}

/**
 * GET /api/attendances/export - unduh laporan CSV.
 *
 * Memakai responseType "blob" supaya berkas diterima apa adanya (BOM UTF-8 dan
 * pemisah `;` tetap utuh), lalu diunduh lewat elemen <a> sementara.
 */
export async function downloadAttendanceCsv(query: AttendanceQuery): Promise<void> {
  const response = await api.get<Blob>("/attendances/export", {
    params: query,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-absensi-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
