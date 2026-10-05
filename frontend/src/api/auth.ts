import { api, type ApiSuccessResponse } from "@/lib/axios";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * PATCH /api/auth/password - ganti password akun yang sedang login.
 *
 * Password lama wajib dikirim dan diverifikasi auth-service supaya token yang
 * bocor tidak cukup untuk mengambil alih akun.
 */
export async function changeMyPassword(input: ChangePasswordInput): Promise<void> {
  await api.patch<ApiSuccessResponse<{ id: string }>>("/auth/password", input);
}
