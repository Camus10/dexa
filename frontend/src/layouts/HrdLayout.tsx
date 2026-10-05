import AppLayout from "@/layouts/AppLayout";

/**
 * Layout area HRD (/admin/*).
 *
 * Memakai kerangka `AppLayout`; menu sidebar otomatis berisi sembilan menu HRD
 * karena `AppSidebar` membaca role dari auth store. Pemisahan file ini menjaga
 * struktur route tetap jelas: setiap area punya layout sendiri.
 */
export default function HrdLayout() {
  return <AppLayout />;
}
