import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { fetchMyAttendances } from "@/api/attendances";
import ComponentCard from "@/components/common/ComponentCard";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Badge from "@/components/ui/badge/Badge";
import {
  currentMonth,
  formatClock,
  formatDate,
  formatMinutesLabel,
  monthRange,
} from "@/lib/attendance";
import { getApiErrorMessage } from "@/lib/axios";
import {
  ATTENDANCE_STATUS_BADGE,
  ATTENDANCE_STATUS_LABEL,
  WORK_MODE_BADGE,
  WORK_MODE_LABEL,
  type Attendance,
} from "@/types/attendance";

const LIMIT = 10;

/**
 * Riwayat absensi karyawan.
 *
 * Data diambil per bulan (`startDate`/`endDate` dari filter bulan) supaya
 * tabel tetap ringan, dan dilengkapi pagination.
 */
export default function History() {
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<Attendance[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const range = monthRange(month);
      const result = await fetchMyAttendances({
        ...range,
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
  }, [month, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: DataTableColumn<Attendance>[] = [
    {
      key: "date",
      header: "Tanggal",
      render: (row) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {formatDate(row.date)}
        </span>
      ),
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
        <Badge color={WORK_MODE_BADGE[row.workMode]}>
          {WORK_MODE_LABEL[row.workMode]}
        </Badge>
      ),
    },
    {
      key: "lateMinutes",
      header: "Telat",
      render: (row) =>
        row.lateMinutes > 0 ? (
          <span className="text-error-500">{formatMinutesLabel(row.lateMinutes)}</span>
        ) : (
          "-"
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
    <div className="space-y-4">
      <ComponentCard
        title="Riwayat Absensi"
        desc="Absensi Anda pada bulan yang dipilih."
        action={
          <div>
            <label
              htmlFor="month"
              className="mb-1 block text-theme-xs text-gray-500 dark:text-gray-400"
            >
              Pilih Bulan
            </label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(event) => {
                setPage(1);
                setMonth(event.target.value);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data absensi pada bulan ini."
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </ComponentCard>
    </div>
  );
}
