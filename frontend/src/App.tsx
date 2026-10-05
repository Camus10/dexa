import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "@/routes";
import { applyTheme, useThemeStore } from "@/stores/themeStore";

/**
 * Akar aplikasi.
 *
 * Menyediakan router, seluruh route (`AppRoutes`), dan wadah toast
 * react-hot-toast. Tema terang/gelap disinkronkan ke elemen <html> setiap kali
 * pilihan pengguna berubah.
 */
export default function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
          },
        }}
      />
    </BrowserRouter>
  );
}
