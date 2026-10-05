const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Tanggal hari ini (YYYY-MM-DD) menurut waktu lokal. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Bulan berjalan dalam format YYYY-MM (untuk filter laporan). */
export function currentMonth(): string {
  return todayIsoDate().slice(0, 7);
}

/** "2026-02-05" atau timestamp ISO menjadi "05 Feb 2026". */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${`${date.getDate()}`.padStart(2, "0")} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** Tanggal + jam, mis. "05 Feb 2026 08:52". */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${formatDate(value)} ${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

/** Jam saja, mis. "08:52". */
export function formatClock(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
}

/** Nama hari dalam bahasa Indonesia, mis. "Senin, 05 Feb 2026". */
export function formatLongDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${DAY_NAMES[date.getDay()]}, ${formatDate(value)}`;
}

/** Menit menjadi label durasi, mis. 490 menjadi "8 jam 10 menit". */
export function formatMinutesLabel(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} menit`;
  }

  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`;
}

/** Rentang awal dan akhir bulan dari "YYYY-MM" untuk filter laporan. */
export function monthRange(month: string): { startDate: string; endDate: string } {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${`${lastDay}`.padStart(2, "0")}`,
  };
}

/** "2026-02" menjadi "Februari 2026". */
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const fullNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${fullNames[monthNumber - 1] ?? month} ${year}`;
}
