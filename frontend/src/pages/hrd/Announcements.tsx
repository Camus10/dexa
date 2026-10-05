import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAllAnnouncements,
  updateAnnouncement,
} from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, PlusIcon } from "@/icons";
import { formatDateTime } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  AUDIENCE_LABEL,
  type Announcement,
  type AnnouncementAudience,
  type AnnouncementInput,
} from "@/types/master";

interface AnnouncementForm {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  isActive: boolean;
}

const EMPTY_FORM: AnnouncementForm = {
  title: "",
  body: "",
  audience: "ALL",
  isActive: true,
};

const AUDIENCE_OPTIONS = (
  Object.keys(AUDIENCE_LABEL) as AnnouncementAudience[]
).map((value) => ({ value, label: AUDIENCE_LABEL[value] }));

/**
 * Pengumuman (HRD).
 *
 * Siarkan informasi penting ke karyawan. Audiens menentukan siapa yang melihat
 * pengumuman pada Beranda karyawan (ALL/EMPLOYEE/HRD), dan pengumuman nonaktif
 * tetap tersimpan sebagai arsip.
 */
export default function Announcements() {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setRows(await fetchAllAnnouncements());
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

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      isActive: announcement.isActive,
    });
    setIsFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Judul dan isi pengumuman wajib diisi");
      return;
    }

    const payload: AnnouncementInput = {
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      isActive: form.isActive,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await updateAnnouncement(editing.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      toast.success("Pengumuman disimpan");
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
      await deleteAnnouncement(deleting.id);
      toast.success("Pengumuman dihapus");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<Announcement>[] = [
    {
      key: "title",
      header: "Judul",
      render: (row) => (
        <span className="min-w-0">
          <span className="block font-medium text-gray-800 dark:text-white/90">
            {row.title}
          </span>
          <span className="mt-0.5 block max-w-md truncate text-theme-xs text-gray-500">
            {row.body}
          </span>
        </span>
      ),
    },
    {
      key: "audience",
      header: "Audiens",
      render: (row) => AUDIENCE_LABEL[row.audience],
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
      key: "createdAt",
      header: "Tanggal",
      render: (row) => formatDateTime(row.createdAt),
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
          <Button size="sm" variant="ghost" onClick={() => setDeleting(row)}>
            Hapus
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Pengumuman" crumbs={[{ label: "Pengumuman" }]} />

      <ComponentCard
        title="Pengumuman"
        desc="Siarkan informasi penting ke karyawan."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={openCreate}>
            Buat Pengumuman
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada pengumuman."
        />
      </ComponentCard>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit Pengumuman" : "Buat Pengumuman"}
        description="Pengumuman aktif langsung tampil di Beranda karyawan."
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
            label="Judul"
            value={form.title}
            onChange={(event) =>
              setForm((value) => ({ ...value, title: event.target.value }))
            }
          />
          <TextArea
            label="Isi"
            rows={5}
            value={form.body}
            onChange={(event) =>
              setForm((value) => ({ ...value, body: event.target.value }))
            }
          />
          <Select
            label="Audiens"
            options={AUDIENCE_OPTIONS}
            value={form.audience}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                audience: event.target.value as AnnouncementAudience,
              }))
            }
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
        title="Hapus Pengumuman"
        description="Pengumuman tidak akan tampil lagi di Beranda karyawan."
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
          {deleting ? `"${deleting.title}" akan dihapus.` : ""}
        </p>
      </Modal>
    </div>
  );
}
