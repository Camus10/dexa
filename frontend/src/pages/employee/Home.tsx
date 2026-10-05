import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { checkIn, checkOut, fetchTodayAttendance } from "@/api/attendances";
import { fetchMyEmployee } from "@/api/employees";
import { fetchActiveOfficeLocations, fetchMyAnnouncements } from "@/api/masters";
import { fetchLeaveBalance, fetchMyLeaves } from "@/api/requests";
import CameraCapture from "@/components/CameraCapture";
import Spinner from "@/components/Spinner";
import ComponentCard from "@/components/common/ComponentCard";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { CameraIcon, CheckCircleIcon, TimeIcon } from "@/icons";
import {
  formatClock,
  formatLongDate,
  formatMinutesLabel,
  todayIsoDate,
} from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  findNearestOffice,
  getCurrentPosition,
  reverseGeocode,
} from "@/lib/geolocation";
import {
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_LABEL,
  WORK_MODE_LABEL,
  type Attendance,
  type WorkMode,
} from "@/types/attendance";
import type { EmployeeWithShift } from "@/types/employee";
import type { Announcement, OfficeLocation } from "@/types/master";
import type { LeaveBalance, LeaveRequest } from "@/types/requests";

const WORK_MODE_OPTIONS = (Object.keys(WORK_MODE_LABEL) as WorkMode[]).map(
  (value) => ({ value, label: WORK_MODE_LABEL[value] }),
);

type AbsenAction = "in" | "out";

/**
 * Beranda karyawan.
 *
 * Menampilkan ringkasan absensi hari ini, profil singkat, saldo cuti, dan
 * pengumuman terbaru. Tombol "Absen Masuk"/"Absen Keluar" membuka modal yang
 * menggabungkan tiga hal: mode kerja, selfie lewat kamera, dan koordinat GPS
 * (dipakai backend untuk validasi geofence pada mode WFO).
 */
export default function Home() {
  const [employee, setEmployee] = useState<EmployeeWithShift | null>(null);
  const [today, setToday] = useState<Attendance | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const [action, setAction] = useState<AbsenAction | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>("WFO");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadToday = useCallback(async () => {
    try {
      setToday(await fetchTodayAttendance());
    } catch {
      setToday(null);
    }
  }, []);

  useEffect(() => {
    void fetchMyEmployee()
      .then(setEmployee)
      .catch(() => toast.error("Respons server tidak berisi data karyawan"));

    void fetchMyAnnouncements().then(setAnnouncements).catch(() => undefined);
    void fetchActiveOfficeLocations().then(setOffices).catch(() => undefined);
    void fetchLeaveBalance().then(setBalance).catch(() => undefined);
    void fetchMyLeaves().then(setLeaves).catch(() => undefined);
    void loadToday();
  }, [loadToday]);

  /**
   * Ambil titik GPS karyawan, lalu isi alamatnya lewat reverse geocoding.
   *
   * Titik ini wajib ada sebelum absen dikirim karena dipakai untuk validasi
   * geofence (mode WFO) di attendance-service.
   */
  const captureLocation = async () => {
    setIsLocating(true);

    try {
      const position = await getCurrentPosition();
      setCoords(position);
      setAddress(await reverseGeocode(position.latitude, position.longitude));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengambil lokasi",
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Buka modal absen, sekalian ambil titik lokasi.
  const openModal = (next: AbsenAction) => {
    setAction(next);
    setNotes("");
    setPhoto(null);
    setCoords(null);
    setAddress(null);

    void captureLocation();
  };

  const closeModal = () => setAction(null);

  const submitAbsen = async () => {
    if (!action) {
      return;
    }

    if (!coords) {
      toast.error(
        'Titik lokasi belum diambil. Tekan "Gunakan Lokasi Saya" lalu izinkan akses lokasi.',
      );
      return;
    }

    if (action === "in" && !photo) {
      toast.error("Ambil foto selfie terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      const attendance =
        action === "in"
          ? await checkIn({
              workMode,
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              address: address ?? undefined,
              notes: notes || undefined,
              photo: photo as File,
            })
          : await checkOut({
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              address: address ?? undefined,
              notes: notes || undefined,
              photo,
            });

      setToday(attendance);
      toast.success(
        action === "in" ? "Absen masuk berhasil" : "Absen keluar berhasil",
      );
      closeModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinished = Boolean(today?.checkInTime && today?.checkOutTime);
  const latestLeaves = leaves.slice(0, 3);

  /** Kantor terdekat dari titik pengguna + status apakah di dalam radiusnya. */
  const nearestOffice = coords ? findNearestOffice(coords, offices) : null;
  const isInsideOffice = nearestOffice
    ? nearestOffice.distance <= nearestOffice.office.radiusMeters
    : false;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComponentCard title="Absensi Hari Ini" desc={formatLongDate(todayIsoDate())}>
          <div className="flex flex-wrap items-center gap-3">
            {today ? (
              <Badge
                color={ATTENDANCE_STATUS_BADGE[today.status]}
                size="md"
                startIcon={<CheckCircleIcon className="size-4" />}
              >
                {ATTENDANCE_STATUS_LABEL[today.status]}
              </Badge>
            ) : (
              <Badge color="light" size="md" startIcon={<TimeIcon className="size-4" />}>
                Belum absen
              </Badge>
            )}

            {today?.workMode && (
              <Badge color="info" size="md">
                {WORK_MODE_LABEL[today.workMode]}
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Jam Masuk</p>
              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {formatClock(today?.checkInTime)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500 dark:text-gray-400">Jam Keluar</p>
              <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {formatClock(today?.checkOutTime)}
              </p>
            </div>
          </div>

          {today?.lateMinutes ? (
            <p className="mt-3 text-theme-xs text-error-500">
              Telat {formatMinutesLabel(today.lateMinutes)}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {isFinished ? (
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Absensi hari ini selesai. Terima kasih!
              </p>
            ) : today?.checkInTime ? (
              <Button
                startIcon={<CameraIcon className="size-5" />}
                onClick={() => openModal("out")}
              >
                Absen Keluar
              </Button>
            ) : (
              <Button
                startIcon={<CameraIcon className="size-5" />}
                onClick={() => openModal("in")}
              >
                Absen Masuk
              </Button>
            )}
          </div>
        </ComponentCard>

        <ComponentCard title="Profil Singkat">
          <dl className="space-y-3 text-theme-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Nama</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {employee?.fullName ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">NIK</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {employee?.nik ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Jabatan</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {employee?.position ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Departemen</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {employee?.department ?? "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Shift</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {employee?.shift
                  ? `${employee.shift.name} (${employee.shift.startTime}-${employee.shift.endTime})`
                  : "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500 dark:text-gray-400">Saldo Cuti Tahunan</dt>
              <dd className="font-medium text-gray-800 dark:text-white/90">
                {balance ? `${balance.remaining} dari ${balance.quota} hari` : "-"}
              </dd>
            </div>
          </dl>
        </ComponentCard>
      </div>

      {/* ------------------------------------------------------- pengumuman */}
      <ComponentCard title="Pengumuman" desc="Informasi terbaru dari HRD.">
        {announcements.length === 0 ? (
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Belum ada pengumuman.
          </p>
        ) : (
          <ul className="space-y-4">
            {announcements.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {item.title}
                    </p>
                    <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>

      {/* --------------------------------------------- riwayat pengajuan */}
      <ComponentCard title="Riwayat Pengajuan" desc="Tiga pengajuan cuti/izin terakhir.">
        {latestLeaves.length === 0 ? (
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Belum ada pengajuan cuti/izin.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {latestLeaves.map((leave) => (
              <li
                key={leave.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-theme-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {formatLongDate(leave.startDate)} - {formatLongDate(leave.endDate)}
                </span>
                <Badge color="light">{leave.days} hari</Badge>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>

      {/* ------------------------------------------------- modal absensi */}
      <Modal
        isOpen={action !== null}
        onClose={closeModal}
        title={action === "in" ? "Absen Masuk" : "Absen Keluar"}
        description="Titik lokasi diambil otomatis, lalu lengkapi mode kerja dan foto selfie."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              onClick={() => void submitAbsen()}
              isLoading={isSubmitting}
              disabled={isLocating || !coords}
            >
              Kirim
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {action === "in" && (
            <Select
              label="Mode Kerja"
              options={WORK_MODE_OPTIONS}
              value={workMode}
              onChange={(event) => setWorkMode(event.target.value as WorkMode)}
              hint="Mode WFO divalidasi terhadap radius lokasi kantor."
            />
          )}

          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Lokasi Anda
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void captureLocation()}
                isLoading={isLocating}
              >
                Gunakan Lokasi Saya
              </Button>
            </div>

            <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
              {coords
                ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                : "Lokasi belum diambil."}
            </p>
            {address && (
              <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                {address}
              </p>
            )}

            {isLocating && (
              <p className="mt-2 flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                <Spinner size="sm" />
                Mengambil titik lokasi Anda...
              </p>
            )}

            {!coords && !isLocating && (
              <p className="mt-2 text-theme-xs text-error-500">
                Titik lokasi wajib diambil sebelum absen dikirim. Tekan
                &quot;Gunakan Lokasi Saya&quot; dan izinkan akses lokasi.
              </p>
            )}

            {coords && offices.length === 0 && (
              <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                Belum ada lokasi kantor aktif untuk dibandingkan.
              </p>
            )}

            {nearestOffice && (
              <div className="mt-3 space-y-1">
                <Badge color={isInsideOffice ? "success" : "warning"}>
                  {isInsideOffice ? "Di Dalam Lokasi Kantor" : "Di Luar Radius"}
                </Badge>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  {isInsideOffice
                    ? `Anda berada di dalam lokasi ${nearestOffice.office.name} - jarak ${nearestOffice.distance} m, radius ${nearestOffice.office.radiusMeters} m.`
                    : `Kantor terdekat: ${nearestOffice.office.name} - jarak ${nearestOffice.distance} m, radius ${nearestOffice.office.radiusMeters} m.`}
                </p>
                {action === "in" && workMode === "WFO" && !isInsideOffice && (
                  <p className="text-theme-xs font-medium text-warning-600 dark:text-orange-400">
                    Absensi tetap tersimpan, tetapi akan ditandai di luar
                    geofence.
                  </p>
                )}
              </div>
            )}
          </div>

          <CameraCapture
            onCapture={setPhoto}
            filePrefix={action === "in" ? "absen-masuk" : "absen-keluar"}
          />

          <TextArea
            label="Catatan (opsional)"
            placeholder="Catatan (opsional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </Modal>

    </div>
  );
}
