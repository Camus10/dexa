import type { ReactNode } from "react";

import { CheckCircleIcon, ErrorIcon, InfoIcon } from "@/icons";
import { cn } from "@/utils";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500",
};

const ICON: Record<AlertVariant, ReactNode> = {
  success: <CheckCircleIcon className="size-5" />,
  error: <ErrorIcon className="size-5" />,
  warning: <InfoIcon className="size-5" />,
  info: <InfoIcon className="size-5" />,
};

/**
 * Kotak pesan TailAdmin.
 *
 * Dipakai untuk pesan informatif di halaman, mis. pengingat mengaktifkan GPS
 * sebelum absen atau peringatan berada di luar geofence.
 */
export default function Alert({
  variant = "info",
  title,
  message,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-3 rounded-xl p-4 text-theme-sm",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{ICON[variant]}</span>

      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        {message && <p className="mt-0.5">{message}</p>}
        {children}
      </div>
    </div>
  );
}
