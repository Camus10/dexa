import { Link, NavLink, useNavigate } from "react-router-dom";

import { useSidebar } from "@/context/SidebarContext";
import { LogoutIcon } from "@/icons";
import { NAV_ITEMS } from "@/layouts/navigation";
import { ROLE_LABEL } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils";

/**
 * Sidebar utama.
 *
 * Berisi logo, daftar menu sesuai role pengguna, dan tombol Keluar. Di desktop
 * lebar sidebar mengikuti state `isExpanded`/`isHovered` (290px vs 90px), di
 * mobile ia muncul sebagai drawer yang digeser dari kiri.
 */
export default function AppSidebar() {
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const items = user ? NAV_ITEMS[user.role] : [];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isHovered ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-800",
          isExpanded || isHovered ? "justify-start px-5" : "justify-center",
        )}
      >
        <Link to="/" aria-label="Attendance App">
          <img
            src={
              isExpanded || isHovered
                ? "/images/logo/logo.svg"
                : "/images/logo/logo-icon.svg"
            }
            alt="Attendance App"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-5 py-6">
        {(isExpanded || isHovered) && (
          <p className="mb-2 px-3 text-theme-xs font-medium tracking-wide text-gray-400 uppercase">
            {user ? `Menu ${ROLE_LABEL[user.role]}` : "Menu"}
          </p>
        )}

        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "menu-item",
                isActive ? "menu-item-active" : undefined,
                !isExpanded && !isHovered && "justify-center px-0",
              )
            }
            title={item.name}
          >
            <span className="shrink-0">{item.icon}</span>
            {(isExpanded || isHovered) && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-5 dark:border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "menu-item w-full",
            !isExpanded && !isHovered && "justify-center px-0",
          )}
        >
          <LogoutIcon className="size-5 shrink-0" />
          {(isExpanded || isHovered) && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
