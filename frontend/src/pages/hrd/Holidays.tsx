import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createHoliday,
  deleteHoliday,
  fetchHolidays,
  updateHoliday,
} from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, PlusIcon } from "@/icons";
import { formatDate, formatLongDate } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import type { Holiday } from "@/types/master";

interface HolidayForm {
  date: string;
  name: string;
}

/**
 * Hari Libur (HRD).
 *
 * Kalender hari libur nasional/cuti bersama. attendance-service memakainya
 * untuk menandai tanggal sebagai libur sehingga tidak dihitung alpa.
 */
export default function Holidays() {
  const [rows, setRows] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [form, setForm] = useState<HolidayForm>({ date: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Holiday | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setRows(await fetchHolidays());
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeForm = () => {
    setEditing(null);
    setForm({ date: "", name: "" });
    setIsFormOpen(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ date: "", name: "" });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.date || !form.name.trim()) {
      toast.error("Tanggal dan nama hari libur wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editing) {
        await updateHoliday(editing.id, { date: form.date, name: form.name.trim() });
      } else {
        await createHoliday({ date: form.date, name: form.name.trim() });
      }

      toast.success("Hari libur disimpan");
      closeForm();
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
      await deleteHoliday(deleting.id);
      toast.success("Hari libur dihapus");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<Holiday>[] = [
    {
      key: "date",
      header: "Tanggal",
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {formatLongDate(row.date)}
        </span>
      ),
    },
    { key: "name", header: "Nama" },
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row);
              setForm({ date: row.date, name: row.name });
              setIsFormOpen(true);
            }}
          >
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleting(row)}>
            Hapus
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Hari Libur" crumbs={[{ label: "Hari Libur" }]} />

      <ComponentCard
        title="Hari Libur"
        desc="Hari libur nasional / cuti bersama."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={openCreate}>
            Tambah Hari Libur
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada hari libur."
        />
      </ComponentCard>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editing ? "Edit Hari Libur" : "Tambah Hari Libur"}
        description="Tanggal ini akan ditandai sebagai libur pada rekap absensi."
        footer={
          <>
            <Button variant="outline" onClick={closeForm} disabled={isSubmitting}>
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
            label="Tanggal"
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((value) => ({ ...value, date: event.target.value }))
            }
          />
          <InputField
            label="Nama"
            value={form.name}
            onChange={(event) =>
              setForm((value) => ({ ...value, name: event.target.value }))
            }
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus Hari Libur"
        description="Tanggal akan kembali dihitung sebagai hari kerja."
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
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-theme-sm text-gray-600 dark:text-gray-300">
          {deleting ? `${deleting.name} (${formatDate(deleting.date)}) akan dihapus.` : ""}
        </p>
      </Modal>
    </div>
  );
}
