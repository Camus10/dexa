import type { SelectHTMLAttributes } from "react";

import { cn } from "@/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  /** Opsi kosong di paling atas (mis. "Semua departemen"). */
  placeholder?: string;
}

/**
 * Dropdown select TailAdmin.
 * Memakai <select> bawaan supaya sederhana, mudah diakses, dan ramah
 * React Hook Form - tampilan disamakan lewat utility class Tailwind.
 */
export default function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-theme-sm text-gray-800 shadow-theme-xs focus:outline-none focus:ring-4 dark:bg-gray-900 dark:text-white/90",
          error
            ? "border-error-400 focus:border-error-400 focus:ring-error-500/[0.12]"
            : "border-gray-300 focus:border-brand-400 focus:ring-brand-500/[0.12] dark:border-gray-700",
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="mt-1.5 text-theme-xs text-error-500">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-theme-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
