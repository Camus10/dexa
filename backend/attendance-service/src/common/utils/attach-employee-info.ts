import {
  EmployeeLookup,
  WithEmployeeInfo,
} from '../interfaces/employee-info.interface';

/**
 * Tempelkan nama & NIK karyawan ke setiap baris pengajuan.
 *
 * Dipakai oleh daftar pengajuan versi HRD (cuti/izin, lembur, koreksi absensi)
 * supaya tabel tidak menampilkan `employeeId` mentah. Bila karyawan tidak
 * ditemukan (mis. data sudah dihapus atau employee-service sedang mati),
 * nilainya `null` agar pemanggil bisa menyiapkan tampilan cadangan.
 */
export function attachEmployeeInfo<T extends { employeeId: string }>(
  items: T[],
  employees: EmployeeLookup[],
): WithEmployeeInfo<T>[] {
  const byId = new Map(employees.map((employee) => [employee.id, employee]));

  return items.map((item) => {
    const employee = byId.get(item.employeeId);

    return {
      ...item,
      employeeName: employee?.fullName ?? null,
      employeeNik: employee?.nik ?? null,
    };
  });
}
