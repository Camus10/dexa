import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils";

interface RadioSmProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

/** Radio button versi kecil, dipakai pada baris tabel atau daftar padat. */
export default function RadioSm({ label, className, id, ...rest }: RadioSmProps) {
  const radioId = id ?? `${rest.name}-${rest.value}`;

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "flex items-center gap-2 text-theme-xs text-gray-700 dark:text-gray-300",
        className,
      )}
    >
      <input
        id={radioId}
        type="radio"
        className="size-3.5 shrink-0 border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
        {...rest}
      />
      {label}
    </label>
  );
}
