import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/utils";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Textarea TailAdmin untuk alasan pengajuan, catatan reviewer, dll. */
export default function TextArea({
  label,
  hint,
  error,
  className,
  id,
  rows = 3,
  ...rest
}: TextAreaProps) {
  const textAreaId = id ?? rest.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textAreaId}
          className="mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <textarea
        id={textAreaId}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-4 dark:bg-gray-900 dark:text-white/90",
          error
            ? "border-error-400 focus:border-error-400 focus:ring-error-500/[0.12]"
            : "border-gray-300 focus:border-brand-400 focus:ring-brand-500/[0.12] dark:border-gray-700",
          className,
        )}
        {...rest}
      />

      {error ? (
        <p className="mt-1.5 text-theme-xs text-error-500">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-theme-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
