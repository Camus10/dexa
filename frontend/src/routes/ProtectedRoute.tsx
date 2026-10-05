import { Navigate, Outlet, useLocation } from "react-router-dom";

import { roleHomePath, type UserRole } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  /** Bila diisi, hanya role ini yang boleh mengakses rute turunannya. */
  allowedRole?: UserRole;
}

/**
 * Penjaga rute.
 *
 * - Belum login -> diarahkan ke /login (path tujuan disimpan di state `from`
 *   supaya bisa dikembalikan setelah login berhasil).
 * - Sudah login tapi salah area (mis. karyawan membuka /admin) -> diarahkan ke
 *   halaman awal milik role-nya.
 */
export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return <Outlet />;
}
