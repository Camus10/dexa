import { api, unwrap, type ApiSuccessResponse } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/attendance";
import type {
  CreateAccountInput,
  CreateEmployeeInput,
  EmployeeQuery,
  EmployeeWithShift,
  UpdateEmployeeInput,
} from "@/types/employee";

/** GET /api/employees - daftar karyawan + pagination dan filter (HRD). */
export async function fetchEmployees(
  query: EmployeeQuery,
): Promise<PaginatedResponse<EmployeeWithShift>> {
  const response = await api.get<
    ApiSuccessResponse<PaginatedResponse<EmployeeWithShift>>
  >("/employees", { params: query });

  return unwrap(response);
}

/** GET /api/employees/all - seluruh karyawan tanpa pagination (dropdown/export). */
export async function fetchAllEmployees(): Promise<EmployeeWithShift[]> {
  const response =
    await api.get<ApiSuccessResponse<EmployeeWithShift[]>>("/employees/all");

  return unwrap(response);
}

/** GET /api/employees/me - data karyawan milik akun yang login. */
export async function fetchMyEmployee(): Promise<EmployeeWithShift> {
  const response =
    await api.get<ApiSuccessResponse<EmployeeWithShift>>("/employees/me");

  return unwrap(response);
}

/** GET /api/employees/:id - detail karyawan (HRD). */
export async function fetchEmployee(id: string): Promise<EmployeeWithShift> {
  const response = await api.get<ApiSuccessResponse<EmployeeWithShift>>(
    `/employees/${id}`,
  );

  return unwrap(response);
}

/** POST /api/employees - tambah karyawan (HRD). */
export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<EmployeeWithShift> {
  const response = await api.post<ApiSuccessResponse<EmployeeWithShift>>(
    "/employees",
    input,
  );

  return unwrap(response);
}

/** PATCH /api/employees/:id - ubah data karyawan (HRD). */
export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<EmployeeWithShift> {
  const response = await api.patch<ApiSuccessResponse<EmployeeWithShift>>(
    `/employees/${id}`,
    input,
  );

  return unwrap(response);
}

/** DELETE /api/employees/:id - soft delete (status menjadi INACTIVE). */
export async function deactivateEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}

/** POST /api/employees/:id/account - buatkan akun login (HRD). */
export async function createEmployeeAccount(
  id: string,
  input: CreateAccountInput,
): Promise<EmployeeWithShift> {
  const response = await api.post<ApiSuccessResponse<EmployeeWithShift>>(
    `/employees/${id}/account`,
    input,
  );

  return unwrap(response);
}

/**
 * PATCH /api/employees/:id/account/password - ubah password akun login
 * karyawan (HRD). HRD tidak perlu tahu password lama.
 */
export async function resetEmployeeAccountPassword(
  id: string,
  password: string,
): Promise<void> {
  await api.patch(`/employees/${id}/account/password`, { password });
}
