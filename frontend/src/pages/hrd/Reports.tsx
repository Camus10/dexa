import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { downloadAttendanceCsv, fetchAttendances } from "@/api/attendances";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { DownloadIcon } from "@/icons";
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

const LIMIT = 100;

/**
 * Laporan Absensi (HRD).
 *
 * Ringkasan dihitung dari hasil query rentang tanggal (maksimal 100 baris
 * pertama), lalu berkasnya dapat diunduh sebagai CSV lewat
 * GET /attendances/export - berkas CSV memakai pemisah ";" dan BOM UTF-8 agar
 * rapi saat dibuka di Excel versi Indonesia.
 */
export default function Reports() {
  const initialRange = monthRange(currentMonth());
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAttendances({
        startDate,
        endDate,
        page: 1,
        limit: LIMIT,
      });

      setRows(result.items);
      setTotal(result.total);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    const lateMinutes = rows.reduce((sum, row) => sum + (row.lateMinutes ?? 0), 0);
    const countStatus = (statuses: Attendance["status"][]) =>
      rows.filter((row) => statuses.includes(row.status)).length;

    return [
      { label: "Total Baris", value: `${total}` },
      { label: "Hadir", value: `${countStatus(["PRESENT"])}` },
      { label: "Terlambat", value: `${countStatus(["LATE"])}` },
      { label: "Cuti/Izin", value: `${countStatus(["LEAVE", "PERMIT", "SICK"])}` },
      {
        label: "WFH/WFA",
        value: `${rows.filter((row) => row.workMode !== "WFO").length}`,
      },
      {
        label: "Di Kantor",
        value: `${rows.filter((row) => row.workMode === "WFO").length}`,
      },
      {
        label: "Luar Geofence",
        value: `${rows.filter((row) => row.withinGeofence === false).length}`,
      },
      { label: "Total Telat", value: formatMinutesLabel(lateMinutes) },
    ];
  }, [rows, total]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await downloadAttendanceCsv({ startDate, endDate });
      toast.success("Laporan diunduh");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

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
    {
      key: "lateMinutes",
      header: "Telat",
      render: (row) => (row.lateMinutes > 0 ? formatMinutesLabel(row.lateMinutes) : "-"),
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
      <PageBreadCrumb pageTitle="Laporan Absensi" crumbs={[{ label: "Laporan" }]} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <ComponentCard
        title="Laporan Absensi"
        desc="Pilih rentang tanggal, lalu ekspor berkasnya bila diperlukan."
        action={
          <Button
            startIcon={<DownloadIcon className="size-5" />}
            isLoading={isExporting}
            onClick={() => void handleExport()}
          >
            Export CSV
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
          <InputField
            label="Dari"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <InputField
            label="Sampai"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="Tidak ada data absensi pada rentang ini."
          footer={`Total Baris: ${total}`}
        />
      </ComponentCard>
    </div>
  );
}
