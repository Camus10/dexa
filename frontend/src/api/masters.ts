import { api, unwrap, type ApiSuccessResponse } from "@/lib/axios";
import type {
  Announcement,
  AnnouncementInput,
  Holiday,
  HolidayInput,
  OfficeLocation,
  OfficeLocationInput,
  WorkShift,
  WorkShiftInput,
} from "@/types/master";

/* ------------------------------------------------------------------ shift */

/** GET /api/work-shifts - seluruh shift (HRD). */
export async function fetchWorkShifts(): Promise<WorkShift[]> {
  const response = await api.get<ApiSuccessResponse<WorkShift[]>>("/work-shifts");

  return unwrap(response);
}

/** GET /api/work-shifts/active - shift aktif (dipakai karyawan). */
export async function fetchActiveWorkShifts(): Promise<WorkShift[]> {
  const response = await api.get<ApiSuccessResponse<WorkShift[]>>(
    "/work-shifts/active",
  );

  return unwrap(response);
}

export async function createWorkShift(
  input: WorkShiftInput,
): Promise<WorkShift> {
  const response = await api.post<ApiSuccessResponse<WorkShift>>(
    "/work-shifts",
    input,
  );

  return unwrap(response);
}

export async function updateWorkShift(
  id: string,
  input: WorkShiftInput,
): Promise<WorkShift> {
  const response = await api.patch<ApiSuccessResponse<WorkShift>>(
    `/work-shifts/${id}`,
    input,
  );

  return unwrap(response);
}

export async function deleteWorkShift(id: string): Promise<void> {
  await api.delete(`/work-shifts/${id}`);
}

/* -------------------------------------------------------- lokasi kantor */

/** GET /api/office-locations - seluruh lokasi kantor (HRD). */
export async function fetchOfficeLocations(): Promise<OfficeLocation[]> {
  const response = await api.get<ApiSuccessResponse<OfficeLocation[]>>(
    "/office-locations",
  );

  return unwrap(response);
}

/** GET /api/office-locations/active - lokasi aktif untuk geofencing. */
export async function fetchActiveOfficeLocations(): Promise<OfficeLocation[]> {
  const response = await api.get<ApiSuccessResponse<OfficeLocation[]>>(
    "/office-locations/active",
  );

  return unwrap(response);
}

export async function createOfficeLocation(
  input: OfficeLocationInput,
): Promise<OfficeLocation> {
  const response = await api.post<ApiSuccessResponse<OfficeLocation>>(
    "/office-locations",
    input,
  );

  return unwrap(response);
}

export async function updateOfficeLocation(
  id: string,
  input: OfficeLocationInput,
): Promise<OfficeLocation> {
  const response = await api.patch<ApiSuccessResponse<OfficeLocation>>(
    `/office-locations/${id}`,
    input,
  );

  return unwrap(response);
}

export async function deleteOfficeLocation(id: string): Promise<void> {
  await api.delete(`/office-locations/${id}`);
}

/* ------------------------------------------------------------- hari libur */

/** GET /api/holidays - daftar hari libur (semua role). */
export async function fetchHolidays(params: {
  from?: string;
  to?: string;
} = {}): Promise<Holiday[]> {
  const response = await api.get<ApiSuccessResponse<Holiday[]>>("/holidays", {
    params,
  });

  return unwrap(response);
}

export async function createHoliday(input: HolidayInput): Promise<Holiday> {
  const response = await api.post<ApiSuccessResponse<Holiday>>(
    "/holidays",
    input,
  );

  return unwrap(response);
}

export async function updateHoliday(
  id: string,
  input: HolidayInput,
): Promise<Holiday> {
  const response = await api.patch<ApiSuccessResponse<Holiday>>(
    `/holidays/${id}`,
    input,
  );

  return unwrap(response);
}

export async function deleteHoliday(id: string): Promise<void> {
  await api.delete(`/holidays/${id}`);
}

/* ------------------------------------------------------------ pengumuman */

/** GET /api/announcements - pengumuman aktif sesuai role (semua role). */
export async function fetchMyAnnouncements(): Promise<Announcement[]> {
  const response =
    await api.get<ApiSuccessResponse<Announcement[]>>("/announcements");

  return unwrap(response);
}

/** GET /api/announcements/admin - semua pengumuman (HRD). */
export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const response = await api.get<ApiSuccessResponse<Announcement[]>>(
    "/announcements/admin",
  );

  return unwrap(response);
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<Announcement> {
  const response = await api.post<ApiSuccessResponse<Announcement>>(
    "/announcements",
    input,
  );

  return unwrap(response);
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<Announcement> {
  const response = await api.patch<ApiSuccessResponse<Announcement>>(
    `/announcements/${id}`,
    input,
  );

  return unwrap(response);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/announcements/${id}`);
}
