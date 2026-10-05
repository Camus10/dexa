import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

import Button from "@/components/ui/button/Button";
import Spinner from "@/components/Spinner";
import { CameraIcon, CheckLineIcon, RegenerateIcon } from "@/icons";

interface CameraCaptureProps {
  /**
   * Dipanggil saat pengguna menekan "Gunakan Foto".
   * Berkas berupa JPEG dengan nama `absen-<timestamp>.jpg`.
   */
  onCapture: (file: File) => void;
  /** Awalan nama berkas (mis. "absen-masuk" atau "absen-keluar"). */
  filePrefix?: string;
}

const VIDEO_CONSTRAINTS: Record<string, MediaTrackConstraints> = {
  user: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
  environment: {
    facingMode: { ideal: "environment" },
    width: { ideal: 640 },
    height: { ideal: 480 },
  },
};

/**
 * Kamera selfie untuk absen.
 *
 * Alur: pratinjau langsung -> "Ambil Foto" (menyimpan hasil sebagai data URL)
 * -> "Gunakan Foto" (data URL diubah menjadi File lalu dikirim ke backend
 * sebagai multipart bersama koordinat GPS), atau "Ambil Ulang" bila hasil
 * kurang jelas.
 */
export default function CameraCapture({
  onCapture,
  filePrefix = "absen",
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Simpan hasil jepretan kamera ke state (masih berupa data URL). */
  const takePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();

    if (!screenshot) {
      setError("Gagal mengambil foto. Pastikan kamera aktif lalu coba lagi.");
      return;
    }

    setCaptured(screenshot);
  }, []);

  /** Ubah data URL menjadi File agar bisa dikirim sebagai multipart form-data. */
  const usePhoto = useCallback(async () => {
    if (!captured) {
      return;
    }

    const blob = await (await fetch(captured)).blob();
    const file = new File([blob], `${filePrefix}-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    onCapture(file);
  }, [captured, filePrefix, onCapture]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900">
        {captured ? (
          <img
            src={captured}
            alt="Pratinjau foto absensi"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={isMirrored}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.9}
              videoConstraints={VIDEO_CONSTRAINTS[facingMode]}
              onUserMedia={() => setIsReady(true)}
              onUserMediaError={() =>
                setError(
                  "Kamera tidak dapat diakses. Periksa izin kamera di browser Anda.",
                )
              }
              className="h-full w-full object-cover"
            />

            {!isReady && !error && (
              <span className="absolute inset-0 flex items-center justify-center gap-2 text-theme-sm text-white/80">
                <Spinner size="sm" className="text-white" />
                Menyiapkan kamera...
              </span>
            )}
          </>
        )}
      </div>

      {error && <p className="text-theme-xs text-error-500">{error}</p>}

      {captured ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            startIcon={<RegenerateIcon className="size-5" />}
            onClick={() => setCaptured(null)}
          >
            Ambil Ulang
          </Button>
          <Button
            startIcon={<CheckLineIcon className="size-5" />}
            onClick={() => void usePhoto()}
          >
            Gunakan Foto
          </Button>
        </div>
      ) : (
        <Button
          fullWidth
          startIcon={<CameraIcon className="size-5" />}
          onClick={takePhoto}
          disabled={!isReady}
        >
          Ambil Foto
        </Button>
      )}

      {!captured && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMirrored((value) => !value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {isMirrored ? "Tanpa Mirror" : "Pakai Mirror"}
          </button>

          <button
            type="button"
            onClick={() =>
              setFacingMode((value) =>
                value === "user" ? "environment" : "user",
              )
            }
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {facingMode === "user" ? "Kamera Belakang" : "Kamera Depan"}
          </button>
        </div>
      )}

      {!captured && (
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Posisikan wajah di tengah bingkai, lalu tekan "Ambil Foto".
        </p>
      )}
    </div>
  );
}
