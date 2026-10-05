import axios, { type AxiosError, type AxiosResponse } from "axios";

import { useAuthStore } from "@/stores/authStore";

/** Envelope response sukses dari semua service (TransformInterceptor). */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

/** Envelope response error (AllExceptionsFilter). */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  path?: string;
  timestamp?: string;
}

/** Base URL gateway; semua request frontend lewat sini (bukan ke service). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

/** Base URL file/foto absensi yang diserve lewat gateway. */
export const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL ?? "http://localhost:3000";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Attendance App";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Tempelkan JWT ke setiap request. */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Handling 401 global: sesi dibersihkan lalu diarahkan ke halaman login,
 * supaya pengguna tidak terjebak di halaman yang terus gagal memuat data.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();

      if (token) {
        logout();

        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

/** Ambil isi `data` dari envelope response sukses. */
export function unwrap<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  return response.data.data;
}

/** Ubah error apa pun menjadi pesan yang siap ditampilkan lewat toast. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (message) {
      return message;
    }

    if (!error.response) {
      return "Tidak dapat menghubungi server. Pastikan API Gateway berjalan.";
    }

    return `Request gagal (${error.response.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak terduga";
}

/** URL lengkap foto absensi dari path relatif "/uploads/xxx.jpg". */
export function resolvePhotoUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  return path.startsWith("http") ? path : `${UPLOADS_BASE_URL}${path}`;
}
