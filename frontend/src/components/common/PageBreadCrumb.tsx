import { Link } from "react-router-dom";

import { DashboardAltIcon, ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";

interface Crumb {
  label: string;
  /** Bila diisi, crumb bisa diklik. */
  to?: string;
}

interface PageBreadCrumbProps {
  pageTitle: string;
  /** Jejak navigasi di atas judul; default "Dashboard". */
  crumbs?: Crumb[];
  className?: string;
}

const DEFAULT_CRUMBS: Crumb[] = [{ label: "Dashboard", to: "/" }];

/**
 * Judul halaman + jejak breadcrumb.
 *
 * Dipakai di baris pertama setiap halaman supaya HRD/karyawan selalu tahu
 * sedang berada di halaman apa (mis. "Presensi / Data Absensi").
 */
export default function PageBreadCrumb({
  pageTitle,
  crumbs,
  className,
}: PageBreadCrumbProps) {
  const items = crumbs && crumbs.length ? crumbs : DEFAULT_CRUMBS;

  return (
    <div className={cn("mb-6", className)}>
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-theme-xs text-gray-500 dark:text-gray-400">
        <DashboardAltIcon className="size-4" />
        {items.map((crumb) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {crumb.to ? (
              <Link to={crumb.to} className="transition-colors hover:text-brand-500">
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            <ChevronRightIcon className="size-3" />
          </span>
        ))}
        <span className="font-medium text-gray-700 dark:text-white/90">
          {pageTitle}
        </span>
      </nav>

      <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
    </div>
  );
}
