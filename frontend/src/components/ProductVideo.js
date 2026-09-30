import { ShoppingBag, Dumbbell, Footprints, Trophy, UtensilsCrossed } from 'lucide-react';

export const PRODUCT_ICONS = {
  comandix: UtensilsCrossed,
  miembroscheck: Dumbbell,
  ligafutbol: Trophy,
  podologia: Footprints,
  ventacheck: ShoppingBag,
};

/**
 * Video vertical (9:16) del producto. Si el producto no tiene video, muestra un panel
 * con el ícono y los puntos clave (sin prometer un video).
 */
export default function ProductVideo({ product, className = '' }) {
  const Icon = PRODUCT_ICONS[product.slug];

  if (!product.video) {
    return (
      <div
        className={`relative aspect-[4/3] sm:aspect-[9/16] w-full border border-[#262626] bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 p-6 text-center ${className}`}
        data-testid={`product-media-${product.slug}`}
      >
        <div className="w-14 h-14 flex items-center justify-center border border-[#262626]">
          {Icon && <Icon className="w-7 h-7 text-[#FF2A00]" />}
        </div>
        <p className="text-xl font-bold tracking-tight">{product.name}</p>
        <ul className="space-y-2 text-xs font-mono uppercase tracking-widest text-[#A3A3A3]">
          {product.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <video
      className={`aspect-[9/16] w-full bg-[#0A0A0A] border border-[#262626] object-cover ${className}`}
      controls
      preload="none"
      playsInline
      poster={product.poster}
      aria-label={`Video promocional de ${product.name}`}
      data-testid={`product-video-${product.slug}`}
    >
      <source src={product.video} type="video/mp4" />
      Tu navegador no puede reproducir este video.
    </video>
  );
}
