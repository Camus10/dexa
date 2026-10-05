import type { ReactNode } from "react";

import { cn } from "@/utils";

interface ComponentCardProps {
  title?: ReactNode;
  desc?: ReactNode;
  /** Aksi di kanan judul (mis. tombol "Tambah"). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Kartu putih dengan judul, deskripsi singkat, dan area aksi.
 * Dipakai untuk membungkus tabel, form, dan ringkasan di setiap halaman.
 */
export default function ComponentCard({
  title,
  desc,
  action,
  children,
  className,
  bodyClassName,
}: ComponentCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]",
        className,
      )}
    >
      {(title || desc || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 md:px-6 dark:border-gray-800">
          <div>
            {title && (
              <h3 className="text-theme-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h3>
            )}
            {desc && (
              <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>

          {action}
        </div>
      )}

      <div className={cn("p-5 md:p-6", bodyClassName)}>{children}</div>
    </div>
  );
}
