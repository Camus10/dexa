import type { ReactNode } from "react";

import { cn } from "@/utils";

/**
 * Warna badge yang tersedia.
 *
 * Nama warna inilah yang dipakai peta status di folder `types` (mis.
 * `ATTENDANCE_STATUS_BADGE` -> "success"), sehingga halaman cukup menulis
 * `<Badge color={ATTENDANCE_STATUS_BADGE[row.status]} />` tanpa menghafal class.
 */
export type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export type BadgeVariant = "light" | "solid";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  startIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const LIGHT_COLOR: Record<BadgeColor, string> = {
  primary: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
  light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
  dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white/80",
};

const SOLID_COLOR: Record<BadgeColor, string> = {
  primary: "bg-brand-500 text-white",
  success: "bg-success-500 text-white",
  error: "bg-error-500 text-white",
  warning: "bg-warning-500 text-white",
  info: "bg-blue-light-500 text-white",
  light: "bg-gray-400 text-white",
  dark: "bg-gray-800 text-white",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-theme-xs",
  md: "px-3 py-1 text-theme-sm",
};

/**
 * Badge TailAdmin untuk status absensi, mode kerja, status karyawan, dan
 * status pengajuan (lihat peta `*_BADGE` di `src/types`).
 */
export default function Badge({
  color = "primary",
  variant = "light",
  size = "sm",
  startIcon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full font-medium",
        SIZE_CLASS[size],
        variant === "light" ? LIGHT_COLOR[color] : SOLID_COLOR[color],
        className,
      )}
    >
      {startIcon && <span className="shrink-0">{startIcon}</span>}
      {children}
    </span>
  );
}
