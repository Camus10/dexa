import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
}

/** Radio button TailAdmin (ukuran standar). */
export default function Radio({
  label,
  hint,
  className,
  id,
  ...rest
}: RadioProps) {
  const radioId = id ?? `${rest.name}-${rest.value}`;

  return (
    <label
      htmlFor={radioId}
      className={cn("flex items-start gap-2 text-theme-sm text-gray-700 dark:text-gray-300", className)}
    >
      <input
        id={radioId}
        type="radio"
        className="mt-0.5 size-4 shrink-0 border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
        {...rest}
      />

      <span>
        {label}
        {hint && (
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
