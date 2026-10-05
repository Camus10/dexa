import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { fetchAttendanceDetail, fetchAttendances } from "@/api/attendances";
import { fetchOfficeLocations } from "@/api/masters";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Select from "@/components/form/Select";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { Modal } from "@/components/ui/modal";
import { EyeIcon } from "@/icons";
import {
  currentMonth,
  formatClock,
  formatDate,
  formatMinutesLabel,
  monthRange,
} from "@/lib/attendance";
import { getApiErrorMessage, resolvePhotoUrl } from "@/lib/axios";
import {
  googleMapsDirectionsUrl,
  googleMapsUrl,
} from "@/lib/geolocation";
import {
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_LABEL,
  WORK_MODE_BADGE,
  WORK_MODE_LABEL,
  type Attendance,
  type AttendanceStatus,
  type WorkMode,
} from "@/types/attendance";
import type { OfficeLocation } from "@/types/master";

const LIMIT = 10;

/**
 * Data Absensi (HRD).
 *
 * Filter tanggal (default bulan berjalan), status, dan mode kerja; kolom
 * "Geofence" menandai absen WFO yang berada di dalam/luar radius kantor.
 * Tombol Detail menampilkan foto selfie, koordinat, dan tautan Google Maps.
 */
export default function Attendances() {
  const initialRange = monthRange(currentMonth());
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const [workMode, setWorkMode] = useState<WorkMode | "">("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState<Attendance | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAttendances({
        startDate,
        endDate,
        status: status || undefined,
        workMode: workMode || undefined,
        page,
        limit: LIMIT,
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
  }, [endDate, page, startDate, status, workMode]);

  useEffect(() => {
    void load();
  }, [load]);

  // Master kantor dipakai untuk menggambar rute absen -> kantor di Google Maps.
  useEffect(() => {
    void fetchOfficeLocations().then(setOffices).catch(() => undefined);
  }, []);

  const openDetail = async (id: string) => {
    setIsDetailLoading(true);

    try {
      setDetail(await fetchAttendanceDetail(id));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const geofenceCell = (row: Attendance) => {
    if (row.withinGeofence === null || row.withinGeofence === undefined) {
      return "-";
    }

    return (
      <Badge color={row.withinGeofence ? "success" : "error"}>
        {row.withinGeofence ? "Di Kantor" : "Luar Geofence"}
      </Badge>
    );
  };

  /** Titik koordinat absen (pakai jam masuk; jatuh ke keluar bila perlu). */
  const attendancePoint = (row: Attendance) => {
    if (row.checkInLatitude !== null && row.checkInLongitude !== null) {
      return { latitude: row.checkInLatitude, longitude: row.checkInLongitude };
    }

    if (row.checkOutLatitude !== null && row.checkOutLongitude !== null) {
      return {
        latitude: row.checkOutLatitude,
        longitude: row.checkOutLongitude,
      };
    }

    return null;
  };

  /**
   * Kantor asal absen.
   *
   * `officeLocationId` di baris absensi cuma snapshot saat absen, jadi
   * koordinatnya dicari di master Lokasi Kantor; nama dipakai sebagai cadangan
   * kalau lokasinya sudah diubah/dihapus.
   */
  const officeOf = (row: Attendance) =>
    offices.find((office) => office.id === row.officeLocationId) ??
    offices.find((office) => office.name === row.officeLocationName) ??
    null;

  const detailPoint = detail ? attendancePoint(detail) : null;
  const detailOffice = detail ? officeOf(detail) : null;
  const detailRouteUrl =
    detailPoint && detailOffice
      ? googleMapsDirectionsUrl(detailPoint, detailOffice)
      : null;

  const columns: DataTableColumn<Attendance>[] = [
    {
      key: "employeeName",
      header: "Karyawan",
      render: (row) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-gray-800 dark:text-white/90">
            {row.employeeName ?? "-"}
          </span>
          <span className="block truncate text-theme-xs text-gray-500">
            {row.employeeNik ?? "-"}
          </span>
        </span>
      ),
    },
    { key: "date", header: "Tanggal", render: (row) => formatDate(row.date) },
    {
      key: "time",
      header: "Masuk / Keluar",
      render: (row) => `${formatClock(row.checkInTime)} - ${formatClock(row.checkOutTime)}`,
    },
    {
      key: "workMode",
      header: "Mode",
      render: (row) => (
        <Badge color={WORK_MODE_BADGE[row.workMode]}>{WORK_MODE_LABEL[row.workMode]}</Badge>
      ),
    },
    { key: "geofence", header: "Geofence", render: geofenceCell },
    {
      key: "lateMinutes",
      header: "Telat",
      render: (row) =>
        row.lateMinutes > 0 ? formatMinutesLabel(row.lateMinutes) : "-",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge color={ATTENDANCE_STATUS_BADGE[row.status]}>
          {ATTENDANCE_STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          startIcon={<EyeIcon className="size-4" />}
          onClick={() => void openDetail(row.id)}
        >
          Detail
        </Button>
      ),
    },
  ];

  const statusOptions = [
    { value: "", label: "Semua" },
    ...(Object.keys(ATTENDANCE_STATUS_LABEL) as AttendanceStatus[]).map(
      (value) => ({ value, label: ATTENDANCE_STATUS_LABEL[value] }),
    ),
  ];

  const workModeOptions = [
    { value: "", label: "Semua" },
    ...(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((value) => ({
      value,
      label: WORK_MODE_LABEL[value],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Data Absensi" crumbs={[{ label: "Data Absensi" }]} />

      <ComponentCard
        title="Data Absensi"
        desc="Absensi seluruh karyawan pada rentang tanggal yang dipilih."
      >
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Dari"
            type="date"
            value={startDate}
            onChange={(event) => {
              setPage(1);
              setStartDate(event.target.value);
            }}
          />
          <InputField
            label="Sampai"
            type="date"
            value={endDate}
            onChange={(event) => {
              setPage(1);
              setEndDate(event.target.value);
            }}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as AttendanceStatus | "");
            }}
          />
          <Select
            label="Mode Kerja"
            options={workModeOptions}
            value={workMode}
            onChange={(event) => {
              setPage(1);
              setWorkMode(event.target.value as WorkMode | "");
            }}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Tidak ada data absensi pada rentang ini."
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </ComponentCard>

      <Modal
        isOpen={detail !== null || isDetailLoading}
        onClose={() => setDetail(null)}
        title="Detail Absensi"
        description={
          detail
            ? `${detail.employeeName ?? "-"} - ${formatDate(detail.date)}`
            : undefined
        }
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <div className="space-y-4 text-theme-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Badge color={ATTENDANCE_STATUS_BADGE[detail.status]}>
                {ATTENDANCE_STATUS_LABEL[detail.status]}
              </Badge>
              <Badge color={WORK_MODE_BADGE[detail.workMode]}>
                {WORK_MODE_LABEL[detail.workMode]}
              </Badge>
              {geofenceCell(detail)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                <p className="text-theme-xs text-gray-500">Jam Masuk</p>
                <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                  {formatClock(detail.checkInTime)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                <p className="text-theme-xs text-gray-500">Jam Keluar</p>
                <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                  {formatClock(detail.checkOutTime)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-theme-xs text-gray-500">Foto masuk</p>
                {resolvePhotoUrl(detail.checkInPhotoUrl) ? (
                  <img
                    src={resolvePhotoUrl(detail.checkInPhotoUrl) ?? undefined}
                    alt="Foto masuk"
                    className="mt-2 h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <p className="mt-2 text-gray-400">-</p>
                )}
              </div>
              <div>
                <p className="text-theme-xs text-gray-500">Foto keluar</p>
                {resolvePhotoUrl(detail.checkOutPhotoUrl) ? (
                  <img
                    src={resolvePhotoUrl(detail.checkOutPhotoUrl) ?? undefined}
                    alt="Foto keluar"
                    className="mt-2 h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <p className="mt-2 text-gray-400">-</p>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-theme-xs text-gray-500">Shift</dt>
                <dd className="mt-1">{detail.shiftName ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-theme-xs text-gray-500">Lokasi Kantor</dt>
                <dd className="mt-1">{detail.officeLocationName ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-theme-xs text-gray-500">Jarak dari kantor</dt>
                <dd className="mt-1">
                  {detail.distanceMeters !== null ? `${detail.distanceMeters} meter` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-theme-xs text-gray-500">Telat</dt>
                <dd className="mt-1">
                  {detail.lateMinutes > 0 ? formatMinutesLabel(detail.lateMinutes) : "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-theme-xs text-gray-500">Alamat absen</dt>
                <dd className="mt-1">
                  {detail.checkInAddress ?? detail.checkOutAddress ?? "-"}
                </dd>
              </div>
              {detail.checkInLatitude !== null && detail.checkInLongitude !== null && (
                <div className="sm:col-span-2">
                  <dt className="text-theme-xs text-gray-500">Koordinat</dt>
                  <dd className="mt-1">
                    <a
                      href={googleMapsUrl(
                        detail.checkInLatitude,
                        detail.checkInLongitude,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-500 hover:text-brand-600"
                    >
                      {detail.checkInLatitude.toFixed(6)},{" "}
                      {detail.checkInLongitude.toFixed(6)} - Lihat di Maps
                    </a>
                  </dd>
                </div>
              )}
              {detailRouteUrl && detailOffice && (
                <div className="sm:col-span-2">
                  <dt className="text-theme-xs text-gray-500">
                    Rute absen ke kantor terdekat
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={detailRouteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-500 hover:text-brand-600"
                    >
                      {detailOffice.name} -{" "}
                      {detail.distanceMeters !== null
                        ? `${detail.distanceMeters} meter`
                        : "jarak tidak diketahui"}{" "}
                      (buka rute di Google Maps)
                    </a>
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-theme-xs text-gray-500">Catatan</dt>
                <dd className="mt-1">
                  {detail.checkInNotes ?? detail.checkOutNotes ?? "-"}
                </dd>
              </div>
            </dl>

          </div>
        )}
      </Modal>
    </div>
  );
}
