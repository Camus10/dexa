import { Link } from "react-router-dom";

import GridShape from "@/components/common/GridShape";
import Button from "@/components/ui/button/Button";
import { roleHomePath } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

/**
 * Halaman 404.
 *
 * Tombolnya menyesuaikan: pengguna yang sudah login diantar kembali ke
 * dashboard milik role-nya, pengguna anonim diantar ke halaman login.
 */
export default function NotFound() {
  const user = useAuthStore((state) => state.user);
  const target = user ? roleHomePath(user.role) : "/login";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-6 dark:bg-gray-900">
      <GridShape />

      <div className="relative mx-auto w-full max-w-md text-center">
        <img
          src="/images/error/404.svg"
          alt="Halaman tidak ditemukan"
          className="mx-auto h-56 w-auto dark:hidden"
        />
        <img
          src="/images/error/404-dark.svg"
          alt="Halaman tidak ditemukan"
          className="mx-auto hidden h-56 w-auto dark:block"
        />

        <h1 className="mt-6 text-title-sm font-semibold text-gray-800 dark:text-white/90">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>

        <Link to={target} className="mt-6 inline-block">
          <Button>{user ? "Kembali ke Dashboard" : "Ke Halaman Login"}</Button>
        </Link>
      </div>
    </div>
  );
}
