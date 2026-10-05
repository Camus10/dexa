import { useEffect, type ReactNode } from "react";

import { CloseLineIcon } from "@/icons";
import { cn } from "@/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Baris tombol di bagian bawah modal. */
  footer?: ReactNode;
  /** Ukuran lebar modal. */
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

/**
 * Modal TailAdmin.
 *
 * Ditutup dengan tombol X atau klik area gelap di belakangnya, dan tombol Esc.
 * Body halaman dikunci scroll-nya selama modal terbuka.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-99999 flex items-start justify-center overflow-y-auto bg-gray-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          "animate-fade-in my-8 w-full rounded-2xl bg-white shadow-theme-xl dark:bg-gray-900",
          SIZE_CLASS[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            {title && (
              <h3 className="text-theme-lg font-semibold text-gray-800 dark:text-white/90">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          >
            <CloseLineIcon className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Pembungkus isi modal (dipakai saat butuh beberapa blok dengan jarak). */
export function ModalBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
