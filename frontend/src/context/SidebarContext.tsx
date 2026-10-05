import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  /** Sidebar melebar (bukan hanya ikon). */
  isExpanded: boolean;
  /** Kursor sedang berada di atas sidebar. */
  isHovered: boolean;
  /** Sidebar mobile (drawer) sedang terbuka. */
  isMobileOpen: boolean;
  setIsHovered: (value: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const DESKTOP_BREAKPOINT = 1024; // sama dengan breakpoint "xl" Tailwind

/**
 * State sidebar (melebar/ikon, hover, dan drawer mobile).
 *
 * Lebar layar menentukan perilaku: di desktop sidebar bisa dikuncupkan menjadi
 * deretan ikon (`isExpanded`), sedangkan di mobile sidebar muncul sebagai
 * drawer dengan latar gelap (`isMobileOpen`).
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < DESKTOP_BREAKPOINT,
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      setIsMobileOpen((value) => !value);
      return;
    }

    setIsExpanded((value) => !value);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((value) => !value);
  }, []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      isExpanded: isMobile || isExpanded,
      isHovered,
      isMobileOpen,
      setIsHovered,
      toggleSidebar,
      toggleMobileSidebar,
    }),
    [isExpanded, isHovered, isMobile, isMobileOpen, toggleSidebar, toggleMobileSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/** Akses state sidebar; hanya boleh dipakai di dalam `SidebarProvider`. */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar harus dipakai di dalam SidebarProvider");
  }

  return context;
}
