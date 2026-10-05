import { Outlet, useLocation } from "react-router-dom";

import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import MobileTabBar from "@/layouts/MobileTabBar";
import { NAV_ITEMS } from "@/layouts/navigation";
import { ROLE_LABEL } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

/**
 * Kerangka aplikasi mobile untuk area karyawan (`/app/*`).
 *
 * Berbeda dari `AppLayout` (template admin dengan sidebar), di sini konten
 * disajikan sebagai **aplikasi ponsel**: satu kolom selebar maksimum 520px yang
 * dipusatkan di layar besar, app bar ringkas berisi judul halaman, dan
 * `MobileTabBar` di bagian bawah. Judul halaman diambil otomatis dari
 * `NAV_ITEMS` sesuai URL aktif, sehingga halaman karyawan tidak perlu lagi
 * menampilkan breadcrumb ala dashboard admin.
 */
export default function MobileAppLayout() {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);

  const items = NAV_ITEMS.EMPLOYEE;
  const activePage =
    items.find((item) => pathname.startsWith(item.path)) ?? items[0];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-gray-50 shadow-theme-lg dark:bg-gray-900">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                {user ? `Masuk sebagai ${ROLE_LABEL[user.role]}` : "Attendance App"}
              </p>
              <h1 className="truncate text-theme-lg font-semibold text-gray-800 dark:text-white/90">
                {activePage.name}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggleButton />
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* pb-28 memberi ruang untuk tab bar yang menempel di bawah. */}
        <main className="flex-1 px-4 pt-4 pb-28">
          <Outlet />
        </main>

        <MobileTabBar />
      </div>
    </div>
  );
}
