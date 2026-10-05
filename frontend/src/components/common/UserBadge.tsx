import Avatar from "@/components/ui/avatar/Avatar";
import { ROLE_LABEL } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils";

interface UserBadgeProps {
  /** Tampilkan juga nama pengguna di samping avatar. */
  showName?: boolean;
  /** Tampilkan role (HRD/Karyawan) di bawah nama. */
  showRole?: boolean;
  className?: string;
}

/**
 * Identitas pengguna yang sedang login.
 *
 * Nama diambil dari bagian email sebelum "@" karena payload JWT hanya berisi
 * id, email, role, dan employeeId.
 */
export default function UserBadge({
  showName = true,
  showRole = true,
  className,
}: UserBadgeProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const name = user.email.split("@")[0];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar name={name} size="md" />

      {showName && (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-theme-sm font-medium text-gray-700 dark:text-gray-300">
            {name}
          </span>
          {showRole && (
            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
              {ROLE_LABEL[user.role]}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
