/**
 * Identitas karyawan yang ditempelkan pada baris pengajuan (khusus HRD).
 *
 * attendance-service hanya menyimpan `employeeId` karena setiap service punya
 * databasenya sendiri (tanpa foreign key antar database), sehingga nama & NIK
 * perlu diambil dari employee-service saat data dikirim ke HRD.
 */
export interface EmployeeInfo {
  employeeName: string | null;
  employeeNik: string | null;
}

/** Data minimal karyawan dari employee-service untuk mencari pemilik pengajuan. */
export interface EmployeeLookup {
  id: string;
  fullName: string;
  nik: string;
}

/** Baris pengajuan + identitas karyawan pelakunya. */
export type WithEmployeeInfo<T> = T & EmployeeInfo;
