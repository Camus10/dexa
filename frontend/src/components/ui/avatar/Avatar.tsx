import { employeeInitials } from "@/lib/employee";
import { cn } from "@/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  /** URL foto; bila kosong, ditampilkan inisial nama. */
  src?: string | null;
  alt?: string;
  /** Nama lengkap - dipakai untuk inisial. */
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "size-6 text-theme-xs",
  sm: "size-8 text-theme-xs",
  md: "size-10 text-theme-sm",
  lg: "size-12 text-theme-md",
  xl: "size-16 text-theme-lg",
};

/**
 * Avatar pengguna/karyawan.
 *
 * Bila karyawan belum punya foto (`photoUrl` kosong), avatar menampilkan
 * inisial nama dengan latar brand supaya tabel dan header tetap rapi.
 */
export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
}: AvatarProps) {
  const label = alt ?? name ?? "User Avatar";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 font-semibold text-white",
        SIZE_CLASS[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        employeeInitials(name)
      )}
    </span>
  );
}
