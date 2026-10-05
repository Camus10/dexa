import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  /** Keterangan kecil di samping label. */
  hint?: string;
}

/** Checkbox TailAdmin dengan label opsional. */
export default function Checkbox({
  label,
  hint,
  className,
  id,
  ...rest
}: CheckboxProps) {
  const checkboxId = id ?? rest.name;

  return (
    <label
      htmlFor={checkboxId}
      className={cn("flex items-start gap-2 text-theme-sm text-gray-700 dark:text-gray-300", className)}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
        {...rest}
      />

      {label && (
        <span>
          {label}
          {hint && (
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {hint}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
