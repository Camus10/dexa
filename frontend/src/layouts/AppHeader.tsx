import ThemeToggleButton from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { MenuIcon } from "@/icons";

/**
 * Header aplikasi.
 *
 * Menempel di atas saat halaman di-scroll. Berisi tombol menu untuk mobile,
 * tombol ganti tema, dan menu pengguna.
 */
export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label="Buka menu"
            className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <MenuIcon className="size-5" />
          </button>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Kuncupkan menu"
            className="hidden size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 lg:flex dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <MenuIcon className="size-5" />
          </button>

          <span className="text-theme-sm font-medium text-gray-500 lg:hidden dark:text-gray-400">
            Attendance App
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
