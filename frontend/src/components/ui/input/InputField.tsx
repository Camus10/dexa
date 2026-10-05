import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  /** Keterangan kecil di bawah input (mis. contoh format). */
  hint?: ReactNode;
  /** Pesan error; bila ada, border berubah merah dan hint disembunyikan. */
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Isi input dari kanan (mis. input angka). */
  align?: "left" | "right";
}

const BASE_CLASS =
  "h-11 w-full rounded-lg border bg-white px-3 text-theme-sm text-gray-800 shadow-theme-xs transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-50 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

/**
 * Input teks TailAdmin: label, ikon opsional, hint, dan pesan error.
 * Dipakai bersama React Hook Form (cukup spread register ke props).
 */
export default function InputField({
  label,
  hint,
  error,
  startIcon,
  endIcon,
  align = "left",
  className,
  id,
  ...rest
}: InputFieldProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
            {startIcon}
          </span>
        )}

        <input
          id={inputId}
          className={cn(
            BASE_CLASS,
            startIcon ? "pl-10" : undefined,
            endIcon ? "pr-10" : undefined,
            align === "right" && "text-right",
            error
              ? "border-error-400 focus:border-error-400 focus:ring-error-500/[0.12]"
              : "border-gray-300 focus:border-brand-400 focus:ring-brand-500/[0.12] dark:border-gray-700",
            className,
          )}
          {...rest}
        />

        {endIcon && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
            {endIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-theme-xs text-error-500">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-theme-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
