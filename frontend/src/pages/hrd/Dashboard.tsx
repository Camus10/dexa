import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { fetchAttendanceSummary, fetchAttendances } from "@/api/attendances";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { ArrowRightIcon } from "@/icons";
import { formatClock, formatDate, todayIsoDate } from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_LABEL,
  WORK_MODE_BADGE,
  WORK_MODE_LABEL,
  type Attendance,
  type AttendanceSummary,
} from "@/types/attendance";
import { cn } from "@/utils";

interface StatCard {
  label: string;
  value: number;
  valueClass?: string;
  hint?: string;
}

/**
 * Dashboard HRD.
 *
 * Menampilkan statistik hari ini dari GET /attendances/summary (jumlah hadir,
 * terlambat, WFO/WFH, dan pengajuan yang menunggu ditinjau) plus lima absensi
 * terbaru supaya HRD bisa cepat memantau aktivitas pagi.
 */
export default function Dashboard() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [recent, setRecent] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const [summaryData, attendanceData] = await Promise.all([
        fetchAttendanceSummary(),
        fetchAttendances({ page: 1, limit: 5 }),
      ]);

      setSummary(summaryData);
      setRecent(attendanceData.items);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingTotal =
    (summary?.pendingLeave ?? 0) +
    (summary?.pendingOvertime ?? 0) +
    (summary?.pendingCorrection ?? 0);

  const cards: StatCard[] = [
    {
      label: "Total Karyawan",
      value: summary?.totalEmployees ?? 0,
      valueClass: "text-gray-800 dark:text-white/90",
    },
    {
      label: "Hadir Hari Ini",
      value: summary?.present ?? 0,
      valueClass: "text-success-600",
    },
    {
      label: "Total Telat",
      value: summary?.late ?? 0,
      valueClass: "text-warning-600",
    },
    {
      label: "Menunggu Persetujuan",
      value: pendingTotal,
      valueClass: "text-blue-light-500",
      hint: `Cuti ${summary?.pendingLeave ?? 0} • Lembur ${
        summary?.pendingOvertime ?? 0
      } • Koreksi ${summary?.pendingCorrection ?? 0}`,
    },
    {
      label: "Di Kantor (WFO)",
      value: summary?.workFromOffice ?? 0,
      valueClass: "text-brand-500",
    },
    {
      label: "WFH / WFA / Lapangan",
      value: summary?.workFromHome ?? 0,
      valueClass: "text-blue-light-500",
    },
    {
      label: "Luar Geofence",
      value: summary?.outsideGeofence ?? 0,
      valueClass: "text-error-500",
    },
    {
      label: "Cuti / Izin / Sakit",
      value: summary?.onLeave ?? 0,
      valueClass: "text-gray-800 dark:text-white/90",
    },
  ];

  const columns: DataTableColumn<Attendance>[] = [
    {
      key: "employeeName",
      header: "Karyawan",
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {row.employeeName ?? "-"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Tanggal",
      render: (row) => formatDate(row.date),
    },
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
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge color={ATTENDANCE_STATUS_BADGE[row.status]}>
          {ATTENDANCE_STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        pageTitle="Dashboard HRD"
        crumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <p className={cn("mt-1 text-xl font-semibold", card.valueClass)}>
              {card.value}
            </p>
            {card.hint && (
              <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
                {card.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      <ComponentCard
        title="Absensi Terbaru"
        desc={`Aktivitas absensi pada ${formatDate(todayIsoDate())}.`}
        action={
          <Link
            to="/admin/attendances"
            className="inline-flex items-center gap-1 text-theme-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Lihat semua
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      >
        <DataTable
          columns={columns}
          data={recent}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data absensi hari ini."
        />
      </ComponentCard>

    </div>
  );
}
