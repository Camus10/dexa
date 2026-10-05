import type { RequestStatus } from "@/types/requests";

/** Opsi filter status pengajuan untuk tab di halaman Persetujuan. */
export const REQUEST_STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

/** Ringkasan singkat pengajuan untuk toast/konfirmasi. */
export function summarizeDecision(
  status: RequestStatus,
  reviewNote?: string,
): string {
  const base =
    status === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak";

  return reviewNote ? `${base} - ${reviewNote}` : base;
}
