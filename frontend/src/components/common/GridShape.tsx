/**
 * Ornamen latar berupa pola kotak-kotak tipis.
 *
 * Hanya dekorasi - dipakai di halaman login dan halaman 404 supaya tampilan
 * tidak polos. Ditandai `aria-hidden` karena tidak punya makna bagi pembaca
 * layar.
 */
export default function GridShape() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-4 -left-4 grid grid-cols-6 gap-4 opacity-[0.06] dark:opacity-[0.04]">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="size-8 rounded border border-brand-500" />
        ))}
      </div>

      <div className="absolute -right-4 -bottom-4 grid grid-cols-6 gap-4 opacity-[0.06] dark:opacity-[0.04]">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="size-8 rounded border border-brand-500" />
        ))}
      </div>
    </div>
  );
}
