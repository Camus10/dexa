import type { ReactNode } from "react";

import Spinner from "@/components/Spinner";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";

export interface DataTableColumn<T> {
  /** Identitas kolom (dipakai juga sebagai key React). */
  key: string;
  /** Teks header kolom, mis. "Tanggal". */
  header: string;
  /** Class tambahan untuk <th> dan <td> kolom ini (mis. "text-end"). */
  className?: string;
  /** Render khusus; bila kosong, nilai `row[key]` ditampilkan apa adanya. */
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Kunci unik tiap baris (biasanya `row.id`). */
  rowKey: (row: T) => string;
  isLoading?: boolean;
  /** Pesan saat data kosong, mis. "Belum ada data karyawan.". */
  emptyMessage?: string;
  /** Halaman aktif (1-based) dan jumlah halaman untuk kontrol pagination. */
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  /** Konten di kaki tabel, mis. ringkasan total. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Tabel data TailAdmin.
 *
 * Dipakai semua halaman daftar (Data Karyawan, Data Absensi, Laporan,
 * Persetujuan) supaya tampilan header, pemisah baris, keadaan loading, dan
 * keadaan kosong konsisten.
 */
export default function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = "Belum ada data.",
  page,
  totalPages,
  total,
  onPageChange,
  footer,
  className,
}: DataTableProps<T>) {
  const showPagination =
    Boolean(onPageChange) && typeof page === "number" && typeof totalPages === "number" && totalPages > 1;

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-start text-theme-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <span className="inline-flex items-center gap-2 text-theme-sm text-gray-500">
                    <Spinner size="sm" className="text-brand-500" />
                    Memuat...
                  </span>
                </td>
              </tr>
            )}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-theme-sm text-gray-700 dark:text-gray-300",
                        column.className,
                      )}
                    >
                      {column.render
                        ? column.render(row)
                        : ((row as Record<string, unknown>)[column.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="border-t border-gray-100 px-4 py-3 text-theme-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {footer}
        </div>
      )}

      {showPagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Halaman {page} dari {totalPages}
            {typeof total === "number" && ` (total ${total} baris)`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange?.((page ?? 1) - 1)}
              disabled={(page ?? 1) <= 1}
              aria-label="Halaman sebelumnya"
              className="flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => onPageChange?.((page ?? 1) + 1)}
              disabled={(page ?? 1) >= (totalPages ?? 1)}
              aria-label="Halaman berikutnya"
              className="flex size-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
