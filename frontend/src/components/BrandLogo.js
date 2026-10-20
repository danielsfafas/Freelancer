/**
 * Marca oficial DanySolutions (ícono + nombre). Se usa en header y footer.
 * El ícono es un recorte del logo oficial (public/brand/danysolutions-mark.png).
 */
export default function BrandLogo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <img
        src="/brand/danysolutions-mark.png"
        alt=""
        aria-hidden="true"
        width="40"
        height="40"
        className="w-10 h-10 shrink-0 border border-[#262626] bg-[#0A0A0A] object-cover group-hover:border-[#FF2A00] transition-colors"
      />
      <span className="font-bold text-lg tracking-tight whitespace-nowrap" data-testid="brand-name">
        Dany<span className="text-[#FF2A00]">Solutions</span>
      </span>
    </span>
  );
}
