import type { ReactNode } from "react";

import { cn } from "@/utils";

interface DropdownItemProps {
  children: ReactNode;
  /** Jalankan aksi lalu tutup menu (dipanggil sebelum onItemClick). */
  onItemClick?: () => void;
  /** Bila diisi, item dirender sebagai <a>. */
  href?: string;
  className?: string;
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-theme-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5";

/** Satu baris pilihan di dalam `Dropdown`. */
export default function DropdownItem({
  children,
  onItemClick,
  href,
  className,
}: DropdownItemProps) {
  if (href) {
    return (
      <a
        href={href}
        role="menuitem"
        onClick={onItemClick}
        className={cn(ITEM_CLASS, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onItemClick}
      className={cn(ITEM_CLASS, "text-left", className)}
    >
      {children}
    </button>
  );
}
