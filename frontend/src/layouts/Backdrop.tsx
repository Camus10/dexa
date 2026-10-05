import { useSidebar } from "@/context/SidebarContext";

/**
 * Lapisan gelap di belakang sidebar mobile.
 *
 * Mengklik area ini menutup sidebar; hanya tampil di layar < 1024px
 * (`lg:hidden`) karena di desktop sidebar selalu terlihat.
 */
export default function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      onClick={toggleMobileSidebar}
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
    />
  );
}
