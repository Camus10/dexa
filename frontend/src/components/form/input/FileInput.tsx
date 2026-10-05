import { useRef, useState } from "react";

import { FileIcon } from "@/icons";
import { cn } from "@/utils";

interface FileInputProps {
  /** Dipanggil dengan berkas terpilih (bukan event). */
  onFileChange: (file: File | null) => void;
  label?: string;
  accept?: string;
  hint?: string;
  error?: string;
  className?: string;
}

/**
 * Input berkas TailAdmin.
 *
 * Nilai yang dikirim ke pemanggil adalah objek `File` (bukan event) supaya
 * mudah dibungkus ke FormData saat mengirim absensi atau lampiran pengajuan.
 */
export default function FileInput({
  onFileChange,
  label,
  accept = "image/*",
  hint,
  error,
  className,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <span className="mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3",
          error
            ? "border-error-400 bg-error-50/50 dark:bg-error-500/5"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-white/5",
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <FileIcon className="size-4" />
          Pilih File
        </button>

        <span className="min-w-0 flex-1 truncate text-theme-sm text-gray-500 dark:text-gray-400">
          {fileName ?? "Belum ada file dipilih"}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setFileName(file?.name ?? null);
            onFileChange(file);
          }}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-theme-xs text-error-500">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-theme-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
