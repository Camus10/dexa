import MobileAppLayout from "@/layouts/MobileAppLayout";

/**
 * Layout area karyawan (/app/*).
 *
 * Memakai kerangka aplikasi mobile (`MobileAppLayout`): app bar ringkas +
 * tab bar bawah (Beranda, Riwayat, Pengajuan, Profil). Pemisahan file ini
 * menjaga struktur route tetap jelas - area karyawan dan area HRD punya
 * layout masing-masing.
 */
export default function EmployeeLayout() {
  return <MobileAppLayout />;
}
