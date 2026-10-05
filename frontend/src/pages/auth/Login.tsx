import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import GridShape from "@/components/common/GridShape";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/ui/input/InputField";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import {
  api,
  getApiErrorMessage,
  unwrap,
  type ApiSuccessResponse,
} from "@/lib/axios";
import { isPathForRole, roleHomePath, type AuthUser } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * Halaman login.
 *
 * Mengirim kredensial ke POST /api/auth/login lewat API Gateway, menyimpan
 * token + profil ke auth store, lalu mengarahkan pengguna ke halaman awal
 * sesuai role (HRD ke /admin/dashboard, karyawan ke /app/home). Bila pengguna
 * sebelumnya diarahkan ke login dari halaman tertentu (`state.from`), mereka
 * dikembalikan ke halaman itu selama areanya sesuai role.
 */
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Sudah login -> tidak perlu melihat form lagi.
  if (token && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);

    try {
      const response = await api.post<ApiSuccessResponse<LoginResponse>>(
        "/auth/login",
        values,
      );
      const result = unwrap(response);

      setSession(result.accessToken, result.user);
      toast.success("Login berhasil");

      const from = (location.state as { from?: string } | null)?.from;
      const destination =
        from && isPathForRole(from, result.user.role)
          ? from
          : roleHomePath(result.user.role);

      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 dark:bg-gray-900">
      <GridShape />

      <div className="relative flex w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg lg:flex-row dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="w-full p-6 sm:p-10 lg:w-1/2">
          <div className="mb-8">
            <Link to="/login" className="inline-block" aria-label="Attendance App">
              <img
                src="/images/logo/logo.svg"
                alt="Attendance App"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/images/logo/logo-dark.svg"
                alt="Attendance App"
                className="hidden h-8 w-auto dark:block"
              />
            </Link>

            <h1 className="mt-6 text-title-sm font-semibold text-gray-800 dark:text-white/90">
              Masuk ke akun Anda
            </h1>
            <p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
              Gunakan email dan password yang terdaftar untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <InputField
              label="Email"
              type="email"
              placeholder="nama@dexa.co.id"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="minimal 6 karakter"
              autoComplete="current-password"
              error={errors.password?.message}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5" />
                  ) : (
                    <EyeCloseIcon className="size-5" />
                  )}
                </button>
              }
              {...register("password")}
            />

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Masuk
            </Button>
          </form>
        </div>

        {/* Panel dekoratif (hanya desktop): pengingat fitur utama aplikasi. */}
        <div className="relative hidden overflow-hidden bg-brand-500 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
          <div className="relative z-10 max-w-sm p-10 text-center text-white">
            <img
              src="/images/logo/logo-icon.svg"
              alt="Dexa"
              className="mx-auto size-12"
            />
            <h2 className="mt-6 text-theme-xl font-semibold">
              Sistem Absensi Karyawan
            </h2>
            <p className="mt-3 text-theme-sm text-white/80">
              Absen masuk dan keluar dengan selfie dan validasi lokasi, ajukan
              cuti/lembur, dan pantau riwayat kehadiran Anda.
            </p>
          </div>

          <div aria-hidden="true" className="absolute -top-6 -left-6 grid grid-cols-6 gap-4 opacity-20">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} className="size-8 rounded border border-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
