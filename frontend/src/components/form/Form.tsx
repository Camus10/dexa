import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  /** Dipanggil setelah validasi HTML5 lolos. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * Pembungkus form sederhana.
 *
 * Dipakai halaman yang tidak perlu React Hook Form (mis. form filter). Semua
 * atribut <form> lain diteruskan apa adanya.
 */
export default function Form({
  children,
  onSubmit,
  className,
  ...rest
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4", className)}
      {...rest}
    >
      {children}
    </form>
  );
}
