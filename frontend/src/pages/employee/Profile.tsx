import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import { changeMyPassword } from "@/api/auth";
import { fetchMyEmployee } from "@/api/employees";
import { fetchLeaveBalance } from "@/api/requests";
import ComponentCard from "@/components/common/ComponentCard";
import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { EyeCloseIcon, EyeIcon, KeyIcon } from "@/icons";
import { EMPLOYEE_STATUS_BADGE, type EmployeeWithShift } from "@/types/employee";
import { EMPLOYEE_STATUS_LABEL } from "@/types/employee";
import { formatDate } from "@/lib/attendance";
import { getApiErrorMessage, resolvePhotoUrl } from "@/lib/axios";
import { isHrd, ROLE_LABEL } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import type { LeaveBalance } from "@/types/requests";

/**
 * Profil karyawan.
 *
 * Data pribadi diambil dari GET /employees/me, saldo cuti dari
 * GET /leaves/balance/me. Karyawan tidak bisa mengubah data kepegawaiannya
 * sendiri (itu wewenang HRD), tetapi **bisa mengganti password akun login**
 * miliknya lewat kartu "Keamanan" (PATCH /auth/password).
 */
export default function Profile() {
  const [employee, setEmployee] = useState<EmployeeWithShift | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    void fetchMyEmployee()
      .then(setEmployee)
      .catch(() => toast.error("Respons server tidak berisi data karyawan"));

    void fetchLeaveBalance().then(setBalance).catch(() => undefined);
  }, []);

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak sama");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeMyPassword({ currentPassword, newPassword });
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const details: { label: string; value: string }[] = [
    { label: "Nama Lengkap", value: employee?.fullName ?? "-" },
    { label: "NIK", value: employee?.nik ?? "-" },
    { label: "Email", value: employee?.email ?? "-" },
    { label: "Telepon", value: employee?.phone ?? "-" },
    { label: "Jabatan", value: employee?.position ?? "-" },
    { label: "Departemen", value: employee?.department ?? "-" },
    { label: "Tanggal Bergabung", value: formatDate(employee?.joinDate) },
    {
      label: "Shift",
      value: employee?.shift
        ? `${employee.shift.name} (${employee.shift.startTime}-${employee.shift.endTime})`
        : "-",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <ComponentCard title="Identitas">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={resolvePhotoUrl(employee?.photoUrl)}
              name={employee?.fullName}
              size="xl"
            />

            <p className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">
              {employee?.fullName ?? "-"}
            </p>
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              {employee?.position ?? "-"}
            </p>

            {employee && (
              <Badge
                color={EMPLOYEE_STATUS_BADGE[employee.status]}
                className="mt-3"
              >
                {EMPLOYEE_STATUS_LABEL[employee.status]}
              </Badge>
            )}

            <p className="mt-3 text-theme-xs text-gray-500 dark:text-gray-400">
              {user ? `Masuk sebagai ${ROLE_LABEL[user.role]}` : "-"}
            </p>

            {user && isHrd(user.role) && (
              <p className="mt-1 text-theme-xs text-gray-400">
                Akun HRD tidak memiliki data karyawan.
              </p>
            )}
          </div>
        </ComponentCard>

        <ComponentCard title="Saldo Cuti Tahunan">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Kuota</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                {balance?.quota ?? 0} hari
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Terpakai</p>
              <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                {balance?.used ?? 0} hari
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Sisa</p>
              <p className="mt-1 text-xl font-semibold text-success-600">
                {balance?.remaining ?? 0} hari
              </p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label}>
                <dt className="text-theme-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </dt>
                <dd className="mt-1 text-theme-sm text-gray-800 dark:text-white/90">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </ComponentCard>
      </div>

      <ComponentCard
        title="Keamanan"
        desc="Ubah password akun login yang Anda pakai untuk masuk."
      >
        <form onSubmit={submitPassword} noValidate className="space-y-4">
          <InputField
            label="Password Saat Ini"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeIcon className="size-5" />
                ) : (
                  <EyeCloseIcon className="size-5" />
                )}
              </button>
            }
          />

          <InputField
            label="Password Baru"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            hint="Minimal 6 karakter."
          />

          <InputField
            label="Konfirmasi Password Baru"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <Button
            type="submit"
            startIcon={<KeyIcon className="size-5" />}
            isLoading={isChangingPassword}
            fullWidth
          >
            Simpan Password
          </Button>
        </form>
      </ComponentCard>
    </div>
  );
}
