export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Ambil posisi perangkat lewat Geolocation API browser. */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Perangkat/browser ini tidak mendukung fitur lokasi"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Izin lokasi ditolak. Aktifkan akses lokasi di browser untuk validasi geofence."
              : "Gagal mengambil lokasi perangkat. Coba lagi di tempat terbuka.",
          ),
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

/**
 * Ubah koordinat menjadi alamat (reverse geocoding) memakai layanan gratis
 * BigDataCloud - tanpa API key. Bilamana jaringan gagal, alamat diisi "-".
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client" +
      `?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`;

    const response = await fetch(url);

    if (!response.ok) {
      return "-";
    }

    const data = (await response.json()) as {
      locality?: string;
      city?: string;
      principalSubdivision?: string;
    };

    const parts = [data.locality, data.city, data.principalSubdivision].filter(
      (part): part is string => Boolean(part),
    );

    return parts.length ? parts.join(", ") : "-";
  } catch {
    return "-";
  }
}

/** Link Google Maps untuk koordinat absensi (tombol "Lihat di Maps"). */
export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/**
 * Google Maps berupa **rute** dari titik absen ke titik kantor.
 *
 * Dipakai HRD di Data Absensi supaya terlihat sejauh apa karyawan dari kantor,
 * bukan cuma satu titik di peta.
 */
export function googleMapsDirectionsUrl(
  origin: Coordinates,
  destination: Coordinates,
): string {
  return (
    "https://www.google.com/maps/dir/?api=1" +
    `&origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    "&travelmode=driving"
  );
}

/** Atribut minimum sebuah kantor agar bisa dibandingkan dengan titik pengguna. */
export interface GeofenceTarget {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface NearestOffice<T extends GeofenceTarget> {
  office: T;
  /** Jarak lurus (meter) dari titik pengguna ke pusat kantor. */
  distance: number;
}

/**
 * Jarak dua koordinat dalam meter (rumus Haversine).
 *
 * Radius bumi dan rumusnya disamakan dengan attendance-service supaya angka yang
 * tampil di layar karyawan tidak berbeda dengan hasil hitungan server.
 */
export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const earthRadius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return Math.round(
    earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}

/**
 * Kantor terdekat dari titik pengguna.
 *
 * Dipakai panel lokasi di halaman karyawan untuk memberi tahu posisinya lebih
 * dulu: di dalam radius kantor, atau kantor terdekat plus jarak dan radiusnya.
 * Perhitungan resmi tetap di attendance-service.
 */
export function findNearestOffice<T extends GeofenceTarget>(
  from: Coordinates,
  offices: readonly T[],
): NearestOffice<T> | null {
  let nearest: NearestOffice<T> | null = null;

  for (const office of offices) {
    const distance = distanceInMeters(from, office);

    if (!nearest || distance < nearest.distance) {
      nearest = { office, distance };
    }
  }

  return nearest;
}
