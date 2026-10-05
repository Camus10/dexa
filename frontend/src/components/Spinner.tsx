import { cn } from "@/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Teks pendamping untuk pembaca layar. */
  label?: string;
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-4",
};

/** Indikator loading sederhana (dipakai tombol, tabel, dan preview kamera). */
export default function Spinner({
  size = "md",
  className,
  label = "Memuat",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        SIZE_CLASS[size],
        className,
      )}
    />
  );
}
