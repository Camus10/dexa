import type { ReactNode } from "react";

import {
  BarChartIcon,
  BellAltIcon,
  CalenderIcon,
  CheckCircleIcon,
  ClockIcon,
  DashboardAltIcon,
  FileIcon,
  GridIcon,
  ListIcon,
  MapIcon,
  TaskIcon,
  TimeIcon,
  UserCircleIcon,
  UserIcon,
} from "@/icons";
import type { UserRole } from "@/lib/auth";

export interface NavItem {
  name: string;
  path: string;
  /** Ikon sidebar; ukuran diatur di sini agar seragam (size-5). */
  icon: ReactNode;
}

/**
 * Menu sidebar per role.
 *
 * Urutan menu mengikuti alur kerja: dashboard -> data master -> proses ->
 * laporan. Path-nya sama dengan definisi route di `routes/index.tsx`
 * (HRD di bawah /admin, karyawan di bawah /app).
 */
export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  HRD: [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <DashboardAltIcon className="size-5" />,
    },
    {
      name: "Data Karyawan",
      path: "/admin/employees",
      icon: <UserIcon className="size-5" />,
    },
    {
      name: "Data Absensi",
      path: "/admin/attendances",
      icon: <ListIcon className="size-5" />,
    },
    {
      name: "Persetujuan",
      path: "/admin/approvals",
      icon: <CheckCircleIcon className="size-5" />,
    },
    {
      name: "Lokasi Kantor",
      path: "/admin/office-locations",
      icon: <MapIcon className="size-5" />,
    },
    {
      name: "Shift Kerja",
      path: "/admin/work-shifts",
      icon: <ClockIcon className="size-5" />,
    },
    {
      name: "Hari Libur",
      path: "/admin/holidays",
      icon: <CalenderIcon className="size-5" />,
    },
    {
      name: "Pengumuman",
      path: "/admin/announcements",
      icon: <BellAltIcon className="size-5" />,
    },
    {
      name: "Laporan",
      path: "/admin/reports",
      icon: <BarChartIcon className="size-5" />,
    },
  ],
  EMPLOYEE: [
    {
      name: "Beranda",
      path: "/app/home",
      icon: <GridIcon className="size-5" />,
    },
    {
      name: "Riwayat",
      path: "/app/history",
      icon: <TimeIcon className="size-5" />,
    },
    {
      name: "Pengajuan",
      path: "/app/requests",
      icon: <FileIcon className="size-5" />,
    },
    {
      name: "Profil",
      path: "/app/profile",
      icon: <UserCircleIcon className="size-5" />,
    },
  ],
};

/** Ikon yang dipakai di judul grup menu (mis. "Presensi"). */
export const NAV_GROUP_ICON = <TaskIcon className="size-5" />;
