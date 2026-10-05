import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Ukuran teks custom dari `tailwind.config.js` (fontSize.extend).
 *
 * Wajib didaftarkan ke tailwind-merge: tanpa ini tailwind-merge menganggap
 * class seperti "text-theme-sm" sebagai *warna* teks (karena sama-sama berawalan
 * "text-"), sehingga class warna yang ditulis lebih dulu - mis. "text-white"
 * pada Button - dihapus dan teks tombol biru ikut menjadi gelap.
 */
const FONT_SIZE_SCALE = [
  "title-2xl",
  "title-xl",
  "title-lg",
  "title-md",
  "title-sm",
  "theme-xl",
  "theme-lg",
  "theme-md",
  "theme-sm",
  "theme-xs",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZE_SCALE }],
    },
  },
});

/**
 * Gabungkan class Tailwind.
 *
 * clsx menyusun class secara kondisional, tailwind-merge memastikan class
 * yang bertabrakan (mis. "p-2" vs "p-4") tidak menumpuk - yang terakhir menang.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
