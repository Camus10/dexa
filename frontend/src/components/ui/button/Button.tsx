import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ikon di kiri label (pakai komponen dari "@/icons"). */
  startIcon?: ReactNode;
  /** Ikon di kanan label. */
  endIcon?: ReactNode;
  /** Tampilkan spinner menggantikan startIcon saat proses berjalan. */
  isLoading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5",
  ghost:
    "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5",
  danger: "bg-error-500 text-white shadow-theme-xs hover:bg-error-600",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-theme-xs",
  md: "px-4 py-2.5 text-theme-sm",
};

/** Tombol TailAdmin dengan varian warna, ukuran, ikon, dan state loading. */
export default function Button({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/[0.12] disabled:cursor-not-allowed disabled:opacity-70",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        startIcon
      )}
      {children}
      {!isLoading && endIcon}
    </button>
  );
}
