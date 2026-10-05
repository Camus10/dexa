import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createWorkShift,
  deleteWorkShift,
  fetchWorkShifts,
  updateWorkShift,
} from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, PlusIcon } from "@/icons";
import { getApiErrorMessage } from "@/lib/axios";
import type { WorkShift, WorkShiftInput } from "@/types/master";

interface ShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  lateToleranceMinutes: string;
  isActive: boolean;
}

const EMPTY_FORM: ShiftForm = {
  name: "",
  startTime: "09:00",
  endTime: "18:00",
  lateToleranceMinutes: "15",
  isActive: true,
};

/**
 * Shift Kerja (HRD).
 *
 * Master jam kerja + toleransi keterlambatan. Nilai toleransi dipakai
 * attendance-service untuk menghitung `lateMinutes` (dan status LATE) saat
 * karyawan absen masuk.
 */
export default function WorkShifts() {
  const [rows, setRows] = useState<WorkShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<WorkShift | null>(null);
  const [form, setForm] = useState<ShiftForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<WorkShift | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setRows(await fetchWorkShifts());
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (shift: WorkShift) => {
    setEditing(shift);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      lateToleranceMinutes: `${shift.lateToleranceMinutes}`,
      isActive: shift.isActive,
    });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.name.trim()) {
      toast.error("Nama shift wajib diisi");
      return;
    }

    const payload: WorkShiftInput = {
      name: form.name.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      lateToleranceMinutes: Number(form.lateToleranceMinutes) || 0,
      isActive: form.isActive,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await updateWorkShift(editing.id, payload);
      } else {
        await createWorkShift(payload);
      }

      toast.success("Shift disimpan");
      setIsFormOpen(false);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!deleting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteWorkShift(deleting.id);
      toast.success("Shift dinonaktifkan");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<WorkShift>[] = [
    {
      key: "name",
      header: "Nama",
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-white/90">{row.name}</span>
      ),
    },
    { key: "startTime", header: "Jam Mulai", render: (row) => row.startTime },
    { key: "endTime", header: "Jam Selesai", render: (row) => row.endTime },
    {
      key: "lateToleranceMinutes",
      header: "Toleransi",
      render: (row) => `${row.lateToleranceMinutes} menit`,
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <Badge color={row.isActive ? "success" : "light"}>
          {row.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            <PencilIcon className="size-4" />
            Edit
          </Button>
          {row.isActive && (
            <Button size="sm" variant="ghost" onClick={() => setDeleting(row)}>
              Nonaktifkan
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Shift Kerja" crumbs={[{ label: "Shift Kerja" }]} />

      <ComponentCard
        title="Shift Kerja"
        desc="Master jam kerja + toleransi keterlambatan."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={openCreate}>
            Tambah Shift
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada shift."
        />
      </ComponentCard>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit Shift" : "Tambah Shift"}
        description="Jam kerja dan toleransi dipakai untuk menilai keterlambatan."
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
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <InputField
            label="Nama"
            value={form.name}
            onChange={(event) =>
              setForm((value) => ({ ...value, name: event.target.value }))
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Jam Mulai"
              type="time"
              value={form.startTime}
              onChange={(event) =>
                setForm((value) => ({ ...value, startTime: event.target.value }))
              }
            />
            <InputField
              label="Jam Selesai"
              type="time"
              value={form.endTime}
              onChange={(event) =>
                setForm((value) => ({ ...value, endTime: event.target.value }))
              }
            />
          </div>

          <InputField
            label="Toleransi (menit)"
            type="number"
            value={form.lateToleranceMinutes}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                lateToleranceMinutes: event.target.value,
              }))
            }
            hint="Keterlambatan di bawah nilai ini tidak dihitung telat."
          />

          <label className="flex items-center gap-2 text-theme-sm text-gray-700 dark:text-gray-300">
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
        </div>
      </Modal>

      <Modal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Nonaktifkan Shift"
        description="Shift tidak lagi dapat dipilih untuk karyawan baru."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => void submitDelete()}
              isLoading={isSubmitting}
            >
              Nonaktifkan
            </Button>
          </>
        }
      >
        <p className="text-theme-sm text-gray-600 dark:text-gray-300">
          {deleting ? `${deleting.name} akan dinonaktifkan.` : ""}
        </p>
      </Modal>
    </div>
  );
}
