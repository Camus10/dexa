import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthUser } from "@/lib/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** Dipanggil setelah login berhasil. */
  setSession: (token: string, user: AuthUser) => void;
  /** Dipakai tombol Logout dan interceptor 401 di lib/axios.ts. */
  logout: () => void;
}

/**
 * State sesi login.
 *
 * `persist` menyimpan token + user ke localStorage supaya sesi tidak hilang
 * saat halaman di-refresh (token sendiri sudah punya masa berlaku 1 hari).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "attendance-auth" },
  ),
);
