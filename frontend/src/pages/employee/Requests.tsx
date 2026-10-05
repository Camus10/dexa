import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  cancelCorrection,
  cancelLeave,
  cancelOvertime,
  createCorrection,
  createLeave,
  createOvertime,
  fetchMyCorrections,
  fetchMyLeaves,
  fetchMyOvertimes,
} from "@/api/requests";
import ComponentCard from "@/components/common/ComponentCard";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import InputField from "@/components/ui/input/InputField";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PlusIcon } from "@/icons";
import { formatClock, formatDate, todayIsoDate } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  LEAVE_TYPE_LABEL,
  REQUEST_STATUS_BADGE,
  REQUEST_STATUS_LABEL,
  type CorrectionRequest,
  type LeaveRequest,
  type LeaveType,
  type OvertimeRequest,
  type RequestStatus,
} from "@/types/requests";
import { cn } from "@/utils";

type RequestTab = "leave" | "overtime" | "correction";

const TABS: { key: RequestTab; label: string }[] = [
  { key: "leave", label: "Cuti / Izin" },
  { key: "overtime", label: "Lembur" },
  { key: "correction", label: "Koreksi" },
];

const LEAVE_TYPE_OPTIONS = (Object.keys(LEAVE_TYPE_LABEL) as LeaveType[]).map(
  (value) => ({ value, label: LEAVE_TYPE_LABEL[value] }),
);

/** Tombol "Batalkan" hanya muncul untuk pengajuan yang masih menunggu. */
function CancelButton({
  status,
  onCancel,
}: {
  status: RequestStatus;
  onCancel: () => void;
}) {
  if (status !== "PENDING") {
    return null;
  }

  return (
    <Button size="sm" variant="outline" onClick={onCancel}>
      Batalkan
    </Button>
  );
}

/**
 * Halaman pengajuan karyawan.
 *
 * Tiga jenis pengajuan dipisah dengan tab: cuti/izin, lembur, dan koreksi
 * absensi. Ketiganya memakai pola serupa - daftar pengajuan sendiri plus satu
 * modal form, dan pengajuan yang masih berstatus "Menunggu" bisa dibatalkan.
 */
export default function Requests() {
  const [tab, setTab] = useState<RequestTab>("leave");
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    type: "ANNUAL" as LeaveType,
    startDate: todayIsoDate(),
    endDate: todayIsoDate(),
    reason: "",
  });
  const [overtimeForm, setOvertimeForm] = useState({
    date: todayIsoDate(),
    startTime: "17:00",
    endTime: "19:00",
    reason: "",
  });
  const [correctionForm, setCorrectionForm] = useState({
    date: todayIsoDate(),
    requestedCheckIn: "08:30",
    requestedCheckOut: "17:30",
    reason: "",
  });

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const [leaveData, overtimeData, correctionData] = await Promise.all([
        fetchMyLeaves(),
        fetchMyOvertimes(),
        fetchMyCorrections(),
      ]);

      setLeaves(leaveData);
      setOvertimes(overtimeData);
      setCorrections(correctionData);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setIsSubmitting(true);

    try {
      if (tab === "leave") {
        await createLeave(leaveForm);
      } else if (tab === "overtime") {
        await createOvertime(overtimeForm);
      } else {
        await createCorrection({
          date: correctionForm.date,
          requestedCheckIn: correctionForm.requestedCheckIn || undefined,
          requestedCheckOut: correctionForm.requestedCheckOut || undefined,
          reason: correctionForm.reason,
        });
      }

      toast.success("Pengajuan berhasil dikirim");
      setIsModalOpen(false);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancel = async (id: string, kind: RequestTab) => {
    try {
      if (kind === "leave") {
        await cancelLeave(id);
      } else if (kind === "overtime") {
        await cancelOvertime(id);
      } else {
        await cancelCorrection(id);
      }

      toast.success("Pengajuan dibatalkan");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const statusColumn = <T extends { status: RequestStatus }>(): DataTableColumn<T> => ({
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge color={REQUEST_STATUS_BADGE[row.status]}>
        {REQUEST_STATUS_LABEL[row.status]}
      </Badge>
    ),
  });

  const leaveColumns: DataTableColumn<LeaveRequest>[] = [
    { key: "type", header: "Jenis", render: (row) => LEAVE_TYPE_LABEL[row.type] },
    { key: "startDate", header: "Tanggal", render: (row) => formatDate(row.startDate) },
    { key: "endDate", header: "Sampai", render: (row) => formatDate(row.endDate) },
    { key: "days", header: "Jam", render: (row) => `${row.days} hari` },
    { key: "reason", header: "Alasan", render: (row) => row.reason },
    statusColumn<LeaveRequest>(),
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <CancelButton status={row.status} onCancel={() => void cancel(row.id, "leave")} />
      ),
    },
  ];

  const overtimeColumns: DataTableColumn<OvertimeRequest>[] = [
    { key: "date", header: "Tanggal", render: (row) => formatDate(row.date) },
    { key: "startTime", header: "Jam Mulai", render: (row) => formatClock(row.startTime) },
    { key: "endTime", header: "Jam Selesai", render: (row) => formatClock(row.endTime) },
    { key: "hours", header: "Jam", render: (row) => `${row.hours} jam` },
    { key: "reason", header: "Alasan", render: (row) => row.reason },
    statusColumn<OvertimeRequest>(),
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <CancelButton
          status={row.status}
          onCancel={() => void cancel(row.id, "overtime")}
        />
      ),
    },
  ];

  const correctionColumns: DataTableColumn<CorrectionRequest>[] = [
    { key: "date", header: "Tanggal", render: (row) => formatDate(row.date) },
    {
      key: "requestedCheckIn",
      header: "Jam Masuk",
      render: (row) => formatClock(row.requestedCheckIn),
    },
    {
      key: "requestedCheckOut",
      header: "Jam Keluar",
      render: (row) => formatClock(row.requestedCheckOut),
    },
    { key: "reason", header: "Alasan", render: (row) => row.reason },
    statusColumn<CorrectionRequest>(),
    {
      key: "action",
      header: "Aksi",
      render: (row) => (
        <CancelButton
          status={row.status}
          onCancel={() => void cancel(row.id, "correction")}
        />
      ),
    },
  ];

  const activeTable =
    tab === "leave" ? (
      <DataTable
        columns={leaveColumns}
        data={leaves}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Belum ada pengajuan cuti/izin."
      />
    ) : tab === "overtime" ? (
      <DataTable
        columns={overtimeColumns}
        data={overtimes}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Belum ada pengajuan lembur."
      />
    ) : (
      <DataTable
        columns={correctionColumns}
        data={corrections}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Belum ada pengajuan koreksi."
      />
    );

  return (
    <div className="space-y-4">
      <ComponentCard
        title="Pengajuan Saya"
        desc="Ajukan cuti/izin, lembur, atau koreksi absensi lalu pantau statusnya."
        action={
          <Button startIcon={<PlusIcon className="size-5" />} onClick={() => setIsModalOpen(true)}>
            Ajukan
          </Button>
        }
      >
        <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "flex-1 rounded-lg py-2 text-theme-xs font-medium transition-colors",
                tab === item.key
                  ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTable}
      </ComponentCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          tab === "leave"
            ? "Ajukan Cuti / Izin"
            : tab === "overtime"
              ? "Ajukan Lembur"
              : "Ajukan Koreksi"
        }
        description="Pengajuan akan ditinjau HRD sebelum disetujui."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button onClick={() => void submit()} isLoading={isSubmitting}>
              Kirim
            </Button>
          </>
        }
      >
        {tab === "leave" && (
          <div className="space-y-4">
            <Select
              label="Jenis"
              options={LEAVE_TYPE_OPTIONS}
              value={leaveForm.type}
              onChange={(event) =>
                setLeaveForm((form) => ({
                  ...form,
                  type: event.target.value as LeaveType,
                }))
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Tanggal"
                type="date"
                value={leaveForm.startDate}
                onChange={(event) =>
                  setLeaveForm((form) => ({ ...form, startDate: event.target.value }))
                }
              />
              <InputField
                label="Sampai"
                type="date"
                value={leaveForm.endDate}
                onChange={(event) =>
                  setLeaveForm((form) => ({ ...form, endDate: event.target.value }))
                }
              />
            </div>
            <TextArea
              label="Alasan"
              placeholder="Alasan"
              value={leaveForm.reason}
              onChange={(event) =>
                setLeaveForm((form) => ({ ...form, reason: event.target.value }))
              }
            />
          </div>
        )}

        {tab === "overtime" && (
          <div className="space-y-4">
            <InputField
              label="Tanggal"
              type="date"
              value={overtimeForm.date}
              onChange={(event) =>
                setOvertimeForm((form) => ({ ...form, date: event.target.value }))
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Jam Mulai"
                type="time"
                value={overtimeForm.startTime}
                onChange={(event) =>
                  setOvertimeForm((form) => ({ ...form, startTime: event.target.value }))
                }
              />
              <InputField
                label="Jam Selesai"
                type="time"
                value={overtimeForm.endTime}
                onChange={(event) =>
                  setOvertimeForm((form) => ({ ...form, endTime: event.target.value }))
                }
              />
            </div>
            <TextArea
              label="Alasan"
              placeholder="Alasan lembur"
              value={overtimeForm.reason}
              onChange={(event) =>
                setOvertimeForm((form) => ({ ...form, reason: event.target.value }))
              }
            />
          </div>
        )}

        {tab === "correction" && (
          <div className="space-y-4">
            <InputField
              label="Tanggal"
              type="date"
              value={correctionForm.date}
              onChange={(event) =>
                setCorrectionForm((form) => ({ ...form, date: event.target.value }))
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="Jam Masuk"
                type="time"
                value={correctionForm.requestedCheckIn}
                onChange={(event) =>
                  setCorrectionForm((form) => ({
                    ...form,
                    requestedCheckIn: event.target.value,
                  }))
                }
              />
              <InputField
                label="Jam Keluar"
                type="time"
                value={correctionForm.requestedCheckOut}
                onChange={(event) =>
                  setCorrectionForm((form) => ({
                    ...form,
                    requestedCheckOut: event.target.value,
                  }))
                }
              />
            </div>
            <TextArea
              label="Alasan"
              placeholder="Alasan koreksi (mis. lupa absen)"
              value={correctionForm.reason}
              onChange={(event) =>
                setCorrectionForm((form) => ({ ...form, reason: event.target.value }))
              }
            />
          </div>
        )}
      </Modal>

    </div>
  );
}
