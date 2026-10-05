import { MoonIcon, SunIcon } from "@/icons";
import { useThemeStore } from "@/stores/themeStore";

/**
 * Tombol ganti tema terang/gelap.
 *
 * Pilihan disimpan di localStorage (lihat `themeStore`) dan diterapkan dengan
 * menambah class "dark" pada <html>, sesuai `darkMode: "class"` di Tailwind.
 */
export default function ThemeToggleButton() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
    >
      {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  );
}
