import type { LabelHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  /** Tandai field wajib diisi (menampilkan tanda bintang). */
  required?: boolean;
}

/** Label form standar TailAdmin. */
export default function Label({
  children,
  required = false,
  className,
  ...rest
}: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300",
        className,
      )}
      {...rest}
    >
      {children}
      {required && <span className="ml-0.5 text-error-500">*</span>}
    </label>
  );
}
