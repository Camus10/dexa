import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createEmployee,
  createEmployeeAccount,
  deactivateEmployee,
  fetchEmployees,
  resetEmployeeAccountPassword,
  updateEmployee,
} from "@/api/employees";
import { fetchWorkShifts } from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Select from "@/components/form/Select";
import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import {
  CheckLineIcon,
  EyeCloseIcon,
  EyeIcon,
  KeyIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashBinIcon,
} from "@/icons";
import { formatDate } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import type { UserRole } from "@/lib/auth";
import {
  DEPARTMENTS,
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABEL,
  type CreateEmployeeInput,
  type EmployeeStatus,
  type EmployeeWithShift,
} from "@/types/employee";
import type { WorkShift } from "@/types/master";

const LIMIT = 10;

/** Mode modal akun: "create" = buat akun baru, "reset" = ubah password. */
type AccountMode = "create" | "reset";

/** Field pada form karyawan, termasuk blok akun login opsional. */
interface EmployeeForm {
  fullName: string;
  nik: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  shiftId: string;
  isActive: boolean;
  /** Buat akun login sekaligus (hanya ditampilkan saat menambah karyawan). */
  withAccount: boolean;
  accountRole: UserRole;
  accountPassword: string;
  accountPasswordConfirm: string;
}

const EMPTY_FORM: EmployeeForm = {
  fullName: "",
  nik: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  joinDate: "",
  shiftId: "",
  isActive: true,
  withAccount: true,
  accountRole: "EMPLOYEE",
  accountPassword: "",
  accountPasswordConfirm: "",
};

/** Pilihan role akun login yang bisa dibuat HRD. */
const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "Karyawan (EMPLOYEE)" },
  { value: "HRD", label: "HRD (admin)" },
];

/** Tombol mata untuk menyembunyikan/menampilkan password pada InputField. */
function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
      className="text-gray-400 transition-colors hover:text-gray-600"
    >
      {visible ? <EyeIcon className="size-5" /> : <EyeCloseIcon className="size-5" />}
    </button>
  );
}

/**
 * Data Karyawan (HRD).
 *
 * Dua alur utama:
 * 1. **Tambah Karyawan** - satu form berisi data kepegawaian sekaligus
 *    (opsional, tercentang default) pembuatan akun login, jadi HRD tidak perlu
 *    menambah karyawan dulu lalu mencari barisnya untuk membuat akun.
 * 2. **Akun login** - tombol "Buat Akun" untuk karyawan yang belum punya akun,
 *    dan "Ubah Password" untuk mengganti password tanpa tahu password lama
 *    (PATCH /employees/:id/account/password).
 *
 * Pencarian, filter status, dan filter departemen diproses di server.
 */
export default function Employees() {
  const [rows, setRows] = useState<EmployeeWithShift[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [editing, setEditing] = useState<EmployeeWithShift | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accountFor, setAccountFor] = useState<EmployeeWithShift | null>(null);
  const [accountMode, setAccountMode] = useState<AccountMode>("create");
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    confirm: "",
    role: "EMPLOYEE" as UserRole,
  });
  const [showAccountPassword, setShowAccountPassword] = useState(false);

  const [deactivating, setDeactivating] = useState<EmployeeWithShift | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchEmployees({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: status || undefined,
        department: department || undefined,
      });

      setRows(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [department, page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchWorkShifts().then(setShifts).catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowFormPassword(false);
    setIsFormOpen(true);
  };

  const openEdit = (employee: EmployeeWithShift) => {
    setEditing(employee);
    setForm({
      fullName: employee.fullName,
      nik: employee.nik,
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      position: employee.position ?? "",
      department: employee.department ?? "",
      joinDate: employee.joinDate ?? "",
      shiftId: employee.shiftId ?? "",
      isActive: employee.status === "ACTIVE",
      withAccount: false,
      accountRole: "EMPLOYEE",
      accountPassword: "",
      accountPasswordConfirm: "",
    });
    setShowFormPassword(false);
    setIsFormOpen(true);
  };

  /** Buka modal untuk membuat akun login karyawan yang belum punya akun. */
  const openAccountCreate = (employee: EmployeeWithShift) => {
    setAccountMode("create");
    setAccountForm({
      email: employee.email ?? "",
      password: "",
      confirm: "",
      role: "EMPLOYEE",
    });
    setShowAccountPassword(false);
    setAccountFor(employee);
  };

  /** Buka modal ubah password akun (HRD tidak perlu tahu password lama). */
  const openAccountReset = (employee: EmployeeWithShift) => {
    setAccountMode("reset");
    setAccountForm({
      email: employee.email ?? "",
      password: "",
      confirm: "",
      role: "EMPLOYEE",
    });
    setShowAccountPassword(false);
    setAccountFor(employee);
  };

  const submitForm = async () => {
    const fullName = form.fullName.trim();
    const nik = form.nik.trim();
    const email = form.email.trim();
    const withAccount = !editing && form.withAccount;

    if (!fullName || !nik) {
      toast.error("Nama lengkap dan NIK wajib diisi");
      return;
    }

    if (withAccount) {
      if (!email) {
        toast.error("Email wajib diisi untuk membuat akun login");
        return;
      }

      if (form.accountPassword.length < 6) {
        toast.error("Password akun minimal 6 karakter");
        return;
      }

      if (form.accountPassword !== form.accountPasswordConfirm) {
        toast.error("Ulangi password akun tidak sama");
        return;
      }
    }

    const payload: CreateEmployeeInput = {
      fullName,
      nik,
      email: email || undefined,
      phone: form.phone.trim() || undefined,
      position: form.position.trim() || undefined,
      department: form.department || undefined,
      joinDate: form.joinDate || undefined,
      shiftId: form.shiftId || undefined,
      status: form.isActive ? "ACTIVE" : "INACTIVE",
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await updateEmployee(editing.id, payload);
        toast.success("Data karyawan diperbarui");
      } else {
        const created = await createEmployee(payload);
        toast.success("Karyawan ditambahkan");

        if (withAccount) {
          try {
            await createEmployeeAccount(created.id, {
              email,
              password: form.accountPassword,
              role: form.accountRole,
            });
            toast.success("Akun login berhasil dibuat");
          } catch (error) {
            // Karyawan tetap tersimpan; akun bisa dicoba ulang lewat tombol
            // "Buat Akun" pada baris karyawan tersebut.
            toast.error(`Akun login gagal dibuat: ${getApiErrorMessage(error)}`);
          }
        }
      }

      setIsFormOpen(false);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAccount = async () => {
    if (!accountFor) {
      return;
    }

    if (accountMode === "create" && !accountForm.email.trim()) {
      toast.error("Email akun wajib diisi");
      return;
    }

    if (accountForm.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    if (accountForm.password !== accountForm.confirm) {
      toast.error("Ulangi password tidak sama");
      return;
    }

    setIsSubmitting(true);

    try {
      if (accountMode === "create") {
        await createEmployeeAccount(accountFor.id, {
          email: accountForm.email.trim(),
          password: accountForm.password,
          role: accountForm.role,
        });
        toast.success("Akun login berhasil dibuat");
      } else {
        await resetEmployeeAccountPassword(accountFor.id, accountForm.password);
        toast.success("Password akun berhasil diubah");
      }

      setAccountFor(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDeactivate = async () => {
    if (!deactivating) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deactivateEmployee(deactivating.id);
      toast.success("Karyawan dinonaktifkan");
      setDeactivating(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Kembalikan karyawan nonaktif menjadi aktif (kebalikan soft delete). */
  const reactivate = async (employee: EmployeeWithShift) => {
    setIsSubmitting(true);

    try {
      await updateEmployee(employee.id, { status: "ACTIVE" });
      toast.success("Karyawan diaktifkan kembali");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const shiftOptions = [
    { value: "", label: "- Tanpa shift -" },
    ...shifts.map((shift) => ({
      value: shift.id,
      label: `${shift.name} (${shift.startTime}-${shift.endTime})`,
    })),
  ];

  const columns: DataTableColumn<EmployeeWithShift>[] = [
    {
      key: "fullName",
      header: "Nama",
      render: (row) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={row.fullName} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-gray-800 dark:text-white/90">
              {row.fullName}
            </span>
            <span className="block truncate text-theme-xs text-gray-500">
              {row.email ?? "-"}
            </span>
          </span>
        </span>
      ),
    },
    { key: "nik", header: "NIK" },
    { key: "position", header: "Jabatan", render: (row) => row.position ?? "-" },
    { key: "department", header: "Departemen", render: (row) => row.department ?? "-" },
    {
      key: "shiftName",
      header: "Shift",
      render: (row) => row.shift?.name ?? "-",
    },
    {
      key: "joinDate",
      header: "Bergabung",
      render: (row) => formatDate(row.joinDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge color={EMPLOYEE_STATUS_BADGE[row.status]}>
          {EMPLOYEE_STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            startIcon={<PencilIcon className="size-4" />}
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>

          {row.userId ? (
            <Button
              size="sm"
              variant="outline"
              startIcon={<KeyIcon className="size-4" />}
              onClick={() => openAccountReset(row)}
            >
              Ubah Password
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              startIcon={<PlusIcon className="size-4" />}
              onClick={() => openAccountCreate(row)}
            >
              Buat Akun
            </Button>
          )}

          {row.status === "ACTIVE" ? (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<TrashBinIcon className="size-4" />}
              onClick={() => setDeactivating(row)}
              disabled={isSubmitting}
            >
              Nonaktifkan
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<CheckLineIcon className="size-4" />}
              onClick={() => void reactivate(row)}
              disabled={isSubmitting}
            >
              Aktifkan
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Data Karyawan"
        crumbs={[{ label: "Data Karyawan" }]}
      />

      <ComponentCard
        title="Data Karyawan"
        desc="Kelola data karyawan, penempatan shift, dan akun login."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={openCreate}>
            Tambah Karyawan
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField
            placeholder="Nama, NIK, atau email..."
            startIcon={<SearchIcon className="size-4" />}
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />

          <Select
            options={[
              { value: "", label: "Semua" },
              { value: "ACTIVE", label: "Aktif" },
              { value: "INACTIVE", label: "Nonaktif" },
            ]}
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as EmployeeStatus | "");
            }}
          />

          <Select
            options={[
              { value: "", label: "Semua departemen" },
              ...DEPARTMENTS.map((item) => ({ value: item, label: item })),
            ]}
            value={department}
            onChange={(event) => {
              setPage(1);
              setDepartment(event.target.value);
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data karyawan."
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </ComponentCard>

      {/* -------------------------------------------- form karyawan */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Ubah Data Karyawan" : "Tambah Karyawan"}
        description={
          editing
            ? "Perbarui data kepegawaian. Email akun login tidak ikut berubah dari sini."
            : "Isi data kepegawaian; akun login bisa dibuat sekaligus di bagian bawah form."
        }
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button onClick={() => void submitForm()} isLoading={isSubmitting}>
              {editing ? "Simpan Perubahan" : "Simpan Karyawan"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <section>
            <h4 className="mb-3 text-theme-xs font-semibold tracking-wide text-gray-400 uppercase">
              Data Pribadi
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Nama Lengkap"
                value={form.fullName}
                onChange={(event) =>
                  setForm((value) => ({ ...value, fullName: event.target.value }))
                }
              />
              <InputField
                label="NIK"
                placeholder="DXA-0004"
                value={form.nik}
                onChange={(event) =>
                  setForm((value) => ({ ...value, nik: event.target.value }))
                }
              />
              <InputField
                label="Email"
                type="email"
                placeholder="nama@dexa.co.id"
                value={form.email}
                onChange={(event) =>
                  setForm((value) => ({ ...value, email: event.target.value }))
                }
                hint="Dipakai juga sebagai email akun login karyawan."
              />
              <InputField
                label="Telepon"
                value={form.phone}
                onChange={(event) =>
                  setForm((value) => ({ ...value, phone: event.target.value }))
                }
              />
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-theme-xs font-semibold tracking-wide text-gray-400 uppercase">
              Kepegawaian
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Jabatan"
                value={form.position}
                onChange={(event) =>
                  setForm((value) => ({ ...value, position: event.target.value }))
                }
              />
              <Select
                label="Departemen"
                options={[
                  { value: "", label: "- Tanpa departemen -" },
                  ...DEPARTMENTS.map((item) => ({ value: item, label: item })),
                ]}
                value={form.department}
                onChange={(event) =>
                  setForm((value) => ({ ...value, department: event.target.value }))
                }
              />
              <InputField
                label="Tanggal Bergabung"
                type="date"
                value={form.joinDate}
                onChange={(event) =>
                  setForm((value) => ({ ...value, joinDate: event.target.value }))
                }
              />
              <Select
                label="Shift"
                options={shiftOptions}
                value={form.shiftId}
                onChange={(event) =>
                  setForm((value) => ({ ...value, shiftId: event.target.value }))
                }
              />
            </div>

            <label className="mt-4 flex items-center gap-2 text-theme-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((value) => ({ ...value, isActive: event.target.checked }))
                }
                className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
              />
              Aktif
            </label>
          </section>

          {!editing && (
            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.withAccount}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      withAccount: event.target.checked,
                    }))
                  }
                  className="mt-0.5 size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                />
                <span>
                  <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    Buatkan akun login sekarang
                  </span>
                  <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                    Karyawan langsung bisa masuk ke aplikasi memakai email dan
                    password di bawah ini.
                  </span>
                </span>
              </label>

              {form.withAccount && (
                <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Akun login akan memakai email{" "}
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {form.email.trim() || "(isi Email di bagian Data Pribadi)"}
                    </span>
                    .
                  </p>

                  <Select
                    label="Role Akun"
                    options={ROLE_OPTIONS}
                    value={form.accountRole}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        accountRole: event.target.value as UserRole,
                      }))
                    }
                    hint="Pilih HRD hanya bila karyawan ini memang admin."
                  />
                  <InputField
                    label="Password Akun"
                    type={showFormPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.accountPassword}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        accountPassword: event.target.value,
                      }))
                    }
                    hint="Minimal 6 karakter."
                    endIcon={
                      <PasswordToggle
                        visible={showFormPassword}
                        onToggle={() => setShowFormPassword((value) => !value)}
                      />
                    }
                  />
                  <InputField
                    label="Ulangi Password Akun"
                    type={showFormPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.accountPasswordConfirm}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        accountPasswordConfirm: event.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </section>
          )}

          {editing && (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              {editing.userId ? (
                <>
                  <div className="min-w-0">
                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      Akun login aktif
                    </p>
                    <p className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
                      {editing.email ?? "-"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={<KeyIcon className="size-4" />}
                    onClick={() => {
                      setIsFormOpen(false);
                      openAccountReset(editing);
                    }}
                  >
                    Ubah Password
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                    Karyawan ini belum memiliki akun login.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    startIcon={<KeyIcon className="size-4" />}
                    onClick={() => {
                      setIsFormOpen(false);
                      openAccountCreate(editing);
                    }}
                  >
                    Buat Akun
                  </Button>
                </>
              )}
            </section>
          )}
        </div>
      </Modal>

      {/* ------------------------------------------------ modal akun */}
      <Modal
        isOpen={accountFor !== null}
        onClose={() => setAccountFor(null)}
        title={accountMode === "create" ? "Buat Akun Login" : "Ubah Password Akun"}
        description={
          accountFor
            ? accountMode === "create"
              ? `Akun login baru untuk ${accountFor.fullName} (${accountFor.nik}).`
              : `Tetapkan password baru untuk ${accountFor.fullName} (${accountFor.nik}).`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAccountFor(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button onClick={() => void submitAccount()} isLoading={isSubmitting}>
              {accountMode === "create" ? "Buat Akun" : "Simpan Password"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {accountMode === "create" ? (
            <>
              <InputField
                label="Email Akun"
                type="email"
                placeholder="nama@dexa.co.id"
                value={accountForm.email}
                onChange={(event) =>
                  setAccountForm((value) => ({ ...value, email: event.target.value }))
                }
                hint="Email ini dipakai karyawan untuk masuk ke aplikasi."
              />
              <Select
                label="Role Akun"
                options={ROLE_OPTIONS}
                value={accountForm.role}
                onChange={(event) =>
                  setAccountForm((value) => ({
                    ...value,
                    role: event.target.value as UserRole,
                  }))
                }
              />
            </>
          ) : (
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              HRD tidak perlu tahu password lama. Cukup tetapkan password baru lalu
              sampaikan ke karyawan yang bersangkutan.
            </p>
          )}

          <InputField
            label={accountMode === "create" ? "Password" : "Password Baru"}
            type={showAccountPassword ? "text" : "password"}
            autoComplete="new-password"
            value={accountForm.password}
            onChange={(event) =>
              setAccountForm((value) => ({ ...value, password: event.target.value }))
            }
            hint="Minimal 6 karakter."
            endIcon={
              <PasswordToggle
                visible={showAccountPassword}
                onToggle={() => setShowAccountPassword((value) => !value)}
              />
            }
          />
          <InputField
            label="Ulangi Password"
            type={showAccountPassword ? "text" : "password"}
            autoComplete="new-password"
            value={accountForm.confirm}
            onChange={(event) =>
              setAccountForm((value) => ({ ...value, confirm: event.target.value }))
            }
          />
        </div>
      </Modal>

      {/* -------------------------------------------- nonaktifkan */}
      <Modal
        isOpen={deactivating !== null}
        onClose={() => setDeactivating(null)}
        title="Nonaktifkan Karyawan"
        description="Status karyawan akan diubah menjadi nonaktif."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeactivating(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => void submitDeactivate()}
              isLoading={isSubmitting}
            >
              Nonaktifkan
            </Button>
          </>
        }
      >
        <p className="text-theme-sm text-gray-600 dark:text-gray-300">
          {deactivating
            ? `${deactivating.fullName} (${deactivating.nik}) tidak akan muncul pada daftar aktif dan tidak bisa absen sampai diaktifkan kembali.`
            : ""}
        </p>
      </Modal>
    </div>
  );
}

