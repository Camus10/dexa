import { useState } from "react";
import { useNavigate } from "react-router-dom";

import UserBadge from "@/components/common/UserBadge";
import Dropdown from "@/components/ui/dropdown/Dropdown";
import DropdownItem from "@/components/ui/dropdown/DropdownItem";
import { AngleDownIcon, LogoutIcon, UserCircleIcon } from "@/icons";
import { useAuthStore } from "@/stores/authStore";

/**
 * Menu pengguna di header: identitas singkat, tautan ke Profil (khusus
 * karyawan), dan tombol Keluar.
 */
export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <UserBadge showRole={false} />
        <AngleDownIcon className="size-4" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeMenu}
        className="end-0 mt-3 w-56"
      >
        <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            Masuk sebagai
          </p>
          <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {user?.email}
          </p>
        </div>

        {user?.role === "EMPLOYEE" && (
          <DropdownItem
            onItemClick={() => {
              closeMenu();
              navigate("/app/profile");
            }}
          >
            <UserCircleIcon className="size-4" />
            Profil
          </DropdownItem>
        )}

        <DropdownItem onItemClick={handleLogout}>
          <LogoutIcon className="size-4" />
          Keluar
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
