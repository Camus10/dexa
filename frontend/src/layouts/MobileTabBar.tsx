import { NavLink } from "react-router-dom";

import { NAV_ITEMS } from "@/layouts/navigation";
import { cn } from "@/utils";

/**
 * Tab bar bawah bergaya aplikasi mobile untuk area karyawan (`/app/*`).
 *
 * Berisi menu karyawan (Beranda, Riwayat, Pengajuan, Profil) sehingga
 * navigasi utama selalu berada dalam jangkauan jempol - sama seperti aplikasi
 * absensi di ponsel. Lebar bar dibatasi `max-w-[520px]` dan dipusatkan supaya
 * tetap sejajar dengan kolom konten saat halaman dibuka di layar lebar.
 */
export default function MobileTabBar() {
  const items = NAV_ITEMS.EMPLOYEE;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[520px] border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-theme-xs font-medium transition-colors",
                  isActive
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                )
              }
            >
              <span className="flex size-6 items-center justify-center">
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
