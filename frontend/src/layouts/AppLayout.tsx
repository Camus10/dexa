import { Outlet } from "react-router-dom";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layouts/AppHeader";
import AppSidebar from "@/layouts/AppSidebar";
import Backdrop from "@/layouts/Backdrop";
import { cn } from "@/utils";

/** Isi layout: sidebar + header + area halaman (`<Outlet />`). */
function AppLayoutContent() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <Backdrop />

      <div
        className={cn(
          "flex-1 transition-[margin] duration-300 ease-in-out",
          isExpanded || isHovered ? "lg:ms-[290px]" : "lg:ms-[90px]",
          isMobileOpen ? "ms-0" : undefined,
        )}
      >
        <AppHeader />

        <main className="mx-auto max-w-screen-2xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Kerangka halaman setelah login.
 *
 * Menyediakan `SidebarProvider` (state sidebar), header, dan area konten.
 * Dipakai baik oleh area HRD (`HrdLayout`) maupun karyawan (`EmployeeLayout`)
 * menu sidebar otomatis menyesuaikan role pengguna.
 */
export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
}
