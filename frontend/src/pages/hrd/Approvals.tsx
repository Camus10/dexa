import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  fetchCorrections,
  fetchLeaves,
  fetchOvertimes,
  reviewCorrection,
  reviewLeave,
  reviewOvertime,
} from "@/api/requests";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { formatClock, formatDate } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  LEAVE_TYPE_LABEL,
  REQUEST_STATUS_BADGE,
  REQUEST_STATUS_LABEL,
  type CorrectionRequest,
  type LeaveRequest,
  type OvertimeRequest,
  type RequestStatus,
  type RequestWithEmployee,
} from "@/types/requests";
import { cn } from "@/utils";

type ApprovalTab = "leave" | "overtime" | "correction";

/** Baris pengajuan + nama karyawan yang ditempelkan service absensi. */
type ApprovalRow = (LeaveRequest | OvertimeRequest | CorrectionRequest) &
  RequestWithEmployee;

const TABS: { key: ApprovalTab; label: string }[] = [
  { key: "leave", label: "Cuti / Izin" },
  { key: "overtime", label: "Lembur" },
  { key: "correction", label: "Koreksi" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "", label: "Semua" },
];

/**
 * Persetujuan pengajuan (HRD).
 *
 * HRD meninjau cuti/izin, lembur, dan koreksi absensi. Setiap keputusan dikirim
 * lewat PATCH /{resource}/:id/review bersama catatan opsional, dan catatan itu
 * menjadi notifikasi yang dibaca karyawan pada halaman Pengajuan.
 */
export default function Approvals() {
  const [tab, setTab] = useState<ApprovalTab>("leave");
  const [status, setStatus] = useState<RequestStatus | "">("PENDING");
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewing, setReviewing] = useState<ApprovalRow | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = { status: status || undefined, page: 1, limit: 50 };
      const result =
        tab === "leave"
          ? await fetchLeaves(params)
          : tab === "overtime"
            ? await fetchOvertimes(params)
            : await fetchCorrections(params);

      setRows(result.items as ApprovalRow[]);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (decision: "APPROVED" | "REJECTED") => {
    if (!reviewing) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input = { decision, reviewNote: note.trim() || undefined };

      if (tab === "leave") {
        await reviewLeave(reviewing.id, input);
      } else if (tab === "overtime") {
        await reviewOvertime(reviewing.id, input);
      } else {
        await reviewCorrection(reviewing.id, input);
      }

      toast.success(decision === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak");
      setReviewing(null);
      setNote("");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailCell = (row: ApprovalRow) => {
    if (tab === "leave") {
      const leave = row as LeaveRequest;
      return `${LEAVE_TYPE_LABEL[leave.type]} - ${leave.days} hari`;
    }

    if (tab === "overtime") {
      const overtime = row as OvertimeRequest;
      return `${formatClock(overtime.startTime)} - ${formatClock(overtime.endTime)}`;
    }

    const correction = row as CorrectionRequest;
    return `${formatClock(correction.requestedCheckIn)} - ${formatClock(
      correction.requestedCheckOut,
    )}`;
  };

  const dateCell = (row: ApprovalRow) =>
    "startDate" in row ? formatDate(row.startDate) : formatDate(row.date);

  const columns: DataTableColumn<ApprovalRow>[] = [
    {
      key: "employeeName",
      header: "Karyawan",
      render: (row) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-gray-800 dark:text-white/90">
            {row.employeeName ?? "Karyawan tidak dikenal"}
          </span>
          <span className="block truncate text-theme-xs text-gray-500">
            {row.employeeNik ?? "-"}
          </span>
        </span>
      ),
    },
    { key: "date", header: "Tanggal", render: dateCell },
    { key: "detail", header: "Jenis", render: detailCell },
    {
      key: "reason",
      header: "Alasan",
      render: (row) => (
        <span className="inline-block max-w-xs truncate align-middle">
          {row.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge color={REQUEST_STATUS_BADGE[row.status]}>
          {REQUEST_STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      render: (row) =>
        row.status === "PENDING" ? (
          <Button
            size="sm"
            onClick={() => {
              setReviewing(row);
              setNote("");
            }}
          >
            Proses
          </Button>
        ) : (
          <span className="text-theme-xs text-gray-400">
            {row.reviewNote ?? "-"}
          </span>
        ),
    },
  ];

  const emptyMessage =
    tab === "leave"
      ? "Belum ada pengajuan cuti/izin."
      : tab === "overtime"
        ? "Belum ada pengajuan lembur."
        : "Belum ada pengajuan koreksi.";

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Persetujuan" crumbs={[{ label: "Persetujuan" }]} />

      <ComponentCard
        title="Persetujuan"
        desc="Tinjau pengajuan karyawan, lalu setujui atau tolak beserta catatan."
        action={
          <div className="w-40">
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as RequestStatus | "")
              }
            />
          </div>
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

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </ComponentCard>

      <Modal
        isOpen={reviewing !== null}
        onClose={() => setReviewing(null)}
        title="Proses Pengajuan"
        description={
          reviewing
            ? `${reviewing.employeeName ?? "Karyawan tidak dikenal"} - ${dateCell(reviewing)}`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setReviewing(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => void decide("REJECTED")}
              isLoading={isSubmitting}
            >
              Tolak
            </Button>
            <Button
              onClick={() => void decide("APPROVED")}
              isLoading={isSubmitting}
            >
              Setujui
            </Button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-4 text-theme-sm">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
              <p className="text-theme-xs text-gray-500">Rincian</p>
              <p className="mt-1 text-gray-800 dark:text-white/90">
                {detailCell(reviewing)}
              </p>
              <p className="mt-2 text-theme-xs text-gray-500">Alasan karyawan</p>
              <p className="mt-1 text-gray-800 dark:text-white/90">{reviewing.reason}</p>
            </div>

            <TextArea
              label="Catatan (opsional)"
              placeholder="Catatan untuk karyawan (opsional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
