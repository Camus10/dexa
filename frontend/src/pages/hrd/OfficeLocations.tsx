import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createOfficeLocation,
  deleteOfficeLocation,
  fetchOfficeLocations,
  updateOfficeLocation,
} from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import { MapIcon, PencilIcon, PlusIcon } from "@/icons";
import { getApiErrorMessage } from "@/lib/axios";
import { getCurrentPosition, googleMapsUrl } from "@/lib/geolocation";
import type { OfficeLocation, OfficeLocationInput } from "@/types/master";

interface LocationForm {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  isActive: boolean;
}

const EMPTY_FORM: LocationForm = {
  name: "",
  address: "",
  latitude: "-6.2088",
  longitude: "106.8456",
  radiusMeters: "150",
  isActive: true,
};

/**
 * Lokasi Kantor dan Geofencing (HRD).
 *
 * HRD menetapkan titik kantor beserta radius (meter). Radius ini dipakai
 * attendance-service untuk memutuskan absen mode WFO berada di dalam atau di
 * luar geofence; tombol "Gunakan Lokasi Saya" memudahkan mengambil koordinat
 * saat berada di lokasi kantor.
 */
export default function OfficeLocations() {
  const [rows, setRows] = useState<OfficeLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeLocation | null>(null);
  const [form, setForm] = useState<LocationForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<OfficeLocation | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setRows(await fetchOfficeLocations());
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

  const openEdit = (location: OfficeLocation) => {
    setEditing(location);
    setForm({
      name: location.name,
      address: location.address ?? "",
      latitude: `${location.latitude}`,
      longitude: `${location.longitude}`,
      radiusMeters: `${location.radiusMeters}`,
      isActive: location.isActive,
    });
    setIsFormOpen(true);
  };

  const useMyLocation = async () => {
    try {
      const position = await getCurrentPosition();
      setForm((value) => ({
        ...value,
        latitude: position.latitude.toFixed(6),
        longitude: position.longitude.toFixed(6),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengambil lokasi",
      );
    }
  };

  const submitForm = async () => {
    if (!form.name.trim()) {
      toast.error("Nama lokasi wajib diisi");
      return;
    }

    const payload: OfficeLocationInput = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radiusMeters: Number(form.radiusMeters) || 150,
      isActive: form.isActive,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await updateOfficeLocation(editing.id, payload);
        toast.success("Lokasi diperbarui");
      } else {
        await createOfficeLocation(payload);
        toast.success("Lokasi ditambahkan");
      }

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
      await deleteOfficeLocation(deleting.id);
      toast.success("Lokasi dinonaktifkan");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<OfficeLocation>[] = [
    {
      key: "name",
      header: "Nama",
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-white/90">{row.name}</span>
      ),
    },
    { key: "address", header: "Alamat", render: (row) => row.address ?? "-" },
    {
      key: "coordinate",
      header: "Koordinat",
      render: (row) => (
        <a
          href={googleMapsUrl(row.latitude, row.longitude)}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-500 hover:text-brand-600"
        >
          {row.latitude}, {row.longitude}
        </a>
      ),
    },
    { key: "radiusMeters", header: "Radius", render: (row) => `${row.radiusMeters} m` },
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
      <PageBreadCrumb
        pageTitle="Lokasi Kantor dan Geofencing"
        crumbs={[{ label: "Lokasi Kantor" }]}
      />

      <ComponentCard
        title="Lokasi Kantor"
        desc="Atur titik kantor dan radius geofencing absensi WFO (meter)."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={openCreate}>
            Tambah Lokasi
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada lokasi kantor."
        />
      </ComponentCard>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit Lokasi Kantor" : "Tambah Lokasi Kantor"}
        description="Koordinat dan radius dipakai untuk validasi absen mode WFO."
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
          <InputField
            label="Alamat"
            value={form.address}
            onChange={(event) =>
              setForm((value) => ({ ...value, address: event.target.value }))
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Latitude"
              value={form.latitude}
              onChange={(event) =>
                setForm((value) => ({ ...value, latitude: event.target.value }))
              }
            />
            <InputField
              label="Longitude"
              value={form.longitude}
              onChange={(event) =>
                setForm((value) => ({ ...value, longitude: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <InputField
              label="Radius (meter)"
              type="number"
              value={form.radiusMeters}
              onChange={(event) =>
                setForm((value) => ({ ...value, radiusMeters: event.target.value }))
              }
              className="sm:max-w-40"
            />
            <Button
              variant="outline"
              startIcon={<MapIcon className="size-5" />}
              onClick={() => void useMyLocation()}
            >
              Gunakan Lokasi Saya
            </Button>
          </div>

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
        title="Nonaktifkan Lokasi"
        description="Lokasi tidak lagi dipakai untuk validasi absen WFO."
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
