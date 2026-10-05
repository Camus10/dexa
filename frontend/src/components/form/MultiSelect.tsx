import { useEffect, useRef, useState } from "react";

import { AngleDownIcon, CheckLineIcon } from "@/icons";
import { cn } from "@/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  /** Teks saat belum ada pilihan. */
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Pilih beberapa nilai sekaligus.
 *
 * Menampilkan ringkasan pilihan pada kotak, lalu daftar checkbox dibuka saat
 * diklik. Dipakai untuk filter yang membutuhkan lebih dari satu nilai
 * (mis. beberapa departemen sekaligus).
 */
export default function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Pilih beberapa",
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)
    .join(", ");

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <span className="mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-theme-sm text-gray-800 shadow-theme-xs focus:outline-none focus:ring-4 focus:ring-brand-500/[0.12] disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90",
          )}
        >
          <span className={cn("truncate", !selectedLabels && "text-gray-400")}>
            {selectedLabels || placeholder}
          </span>
          <AngleDownIcon className="size-4 shrink-0 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
            {options.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-theme-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  {option.label}
                  {isSelected && (
                    <CheckLineIcon className="size-4 text-brand-500" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
