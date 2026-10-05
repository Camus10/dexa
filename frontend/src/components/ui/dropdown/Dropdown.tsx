import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/utils";

export interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Penentu posisi/lebar menu (mis. "end-0 mt-2 w-56"). */
  className?: string;
}

/**
 * Menu dropdown.
 *
 * Menutup diri saat pengguna mengklik di luar menu atau menekan Esc, sehingga
 * pemanggil cukup menyimpan satu state `isOpen`.
 */
export default function Dropdown({
  isOpen,
  onClose,
  children,
  className,
}: DropdownProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        "absolute z-40 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
