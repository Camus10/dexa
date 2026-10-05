import { api, unwrap, type ApiSuccessResponse } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/attendance";
import type {
  CorrectionRequest,
  CreateCorrectionInput,
  CreateLeaveInput,
  CreateOvertimeInput,
  LeaveBalance,
  LeaveRequest,
  OvertimeRequest,
  RequestStatus,
} from "@/types/requests";

export interface ReviewInput {
  decision: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

/* ------------------------------------------------------------------- cuti */

/** POST /api/leaves - ajukan cuti/izin/sakit (EMPLOYEE). */
export async function createLeave(input: CreateLeaveInput): Promise<LeaveRequest> {
  const response = await api.post<ApiSuccessResponse<LeaveRequest>>(
    "/leaves",
    input,
  );

  return unwrap(response);
}

/** GET /api/leaves/me - riwayat pengajuan sendiri. */
export async function fetchMyLeaves(): Promise<LeaveRequest[]> {
  const response = await api.get<ApiSuccessResponse<LeaveRequest[]>>(
    "/leaves/me",
  );

  return unwrap(response);
}

/** GET /api/leaves/balance/me - saldo cuti tahunan. */
export async function fetchLeaveBalance(): Promise<LeaveBalance> {
  const response =
    await api.get<ApiSuccessResponse<LeaveBalance>>("/leaves/balance/me");

  return unwrap(response);
}

/** PATCH /api/leaves/:id/cancel - batalkan pengajuan sendiri. */
export async function cancelLeave(id: string): Promise<void> {
  await api.patch(`/leaves/${id}/cancel`);
}

/** GET /api/leaves - daftar pengajuan (HRD). */
export async function fetchLeaves(
  params: { status?: RequestStatus; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<LeaveRequest>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<LeaveRequest>>
  >("/leaves", { params });

  return unwrap(response);
}

/** PATCH /api/leaves/:id/review - setujui/tolak (HRD). */
export async function reviewLeave(
  id: string,
  input: ReviewInput,
): Promise<LeaveRequest> {
  const response = await api.patch<ApiSuccessResponse<LeaveRequest>>(
    `/leaves/${id}/review`,
    input,
  );

  return unwrap(response);
}

/* ----------------------------------------------------------------- lembur */

/** POST /api/overtimes - ajukan lembur (EMPLOYEE). */
export async function createOvertime(
  input: CreateOvertimeInput,
): Promise<OvertimeRequest> {
  const response = await api.post<ApiSuccessResponse<OvertimeRequest>>(
    "/overtimes",
    input,
  );

  return unwrap(response);
}

/** GET /api/overtimes/me - riwayat lembur sendiri. */
export async function fetchMyOvertimes(): Promise<OvertimeRequest[]> {
  const response = await api.get<ApiSuccessResponse<OvertimeRequest[]>>(
    "/overtimes/me",
  );

  return unwrap(response);
}

export async function cancelOvertime(id: string): Promise<void> {
  await api.patch(`/overtimes/${id}/cancel`);
}

/** GET /api/overtimes - daftar pengajuan lembur (HRD). */
export async function fetchOvertimes(
  params: { status?: RequestStatus; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<OvertimeRequest>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<OvertimeRequest>>
  >("/overtimes", { params });

  return unwrap(response);
}

export async function reviewOvertime(
  id: string,
  input: ReviewInput,
): Promise<OvertimeRequest> {
  const response = await api.patch<ApiSuccessResponse<OvertimeRequest>>(
    `/overtimes/${id}/review`,
    input,
  );

  return unwrap(response);
}

/* ---------------------------------------------------- koreksi absensi */

/** POST /api/corrections - ajukan koreksi absensi (EMPLOYEE). */
export async function createCorrection(
  input: CreateCorrectionInput,
): Promise<CorrectionRequest> {
  const response = await api.post<ApiSuccessResponse<CorrectionRequest>>(
    "/corrections",
    input,
  );

  return unwrap(response);
}

/** GET /api/corrections/me - riwayat koreksi sendiri. */
export async function fetchMyCorrections(): Promise<CorrectionRequest[]> {
  const response = await api.get<ApiSuccessResponse<CorrectionRequest[]>>(
    "/corrections/me",
  );

  return unwrap(response);
}

export async function cancelCorrection(id: string): Promise<void> {
  await api.patch(`/corrections/${id}/cancel`);
}

/** GET /api/corrections - daftar koreksi (HRD). */
export async function fetchCorrections(
  params: { status?: RequestStatus; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<CorrectionRequest>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<CorrectionRequest>>
  >("/corrections", { params });

  return unwrap(response);
}

export async function reviewCorrection(
  id: string,
  input: ReviewInput,
): Promise<CorrectionRequest> {
  const response = await api.patch<ApiSuccessResponse<CorrectionRequest>>(
    `/corrections/${id}/review`,
    input,
  );

  return unwrap(response);
}
