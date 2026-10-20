import { useEffect, useRef, useState } from 'react';
import { Play, ShoppingBag, Dumbbell, Footprints, Trophy, UtensilsCrossed } from 'lucide-react';

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

  return <PosterVideo product={product} className={className} />;
}

/**
 * Muestra la portada (poster) con un botón de reproducir. El <video> solo se
 * monta al pulsar play, y el indicador de carga aparece únicamente mientras el
 * video realmente está cargando/esperando datos después de pulsar play.
 */
function PosterVideo({ product, className }) {
  const [started, setStarted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!started || !videoRef.current) return;
    const p = videoRef.current.play();
    if (p && typeof p.catch === 'function') p.catch(() => setBuffering(false));
  }, [started]);

  const frame = `relative aspect-[9/16] w-full bg-[#0A0A0A] border border-[#262626] overflow-hidden ${className}`;

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => {
          setBuffering(true);
          setStarted(true);
        }}
        className={`${frame} group block`}
        aria-label={`Reproducir video promocional de ${product.name}`}
        data-testid={`product-video-${product.slug}`}
      >
        <img
          src={product.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width="320"
          height="569"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <span className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FF2A00] group-hover:bg-[#CC2200] shadow-lg transition-colors">
            <Play className="w-7 h-7 text-white translate-x-0.5" fill="currentColor" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className={frame}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        controls
        playsInline
        preload="auto"
        poster={product.poster}
        aria-label={`Video promocional de ${product.name}`}
        data-testid={`product-video-player-${product.slug}`}
        onWaiting={() => setBuffering(true)}
        onLoadStart={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onPause={() => setBuffering(false)}
        onError={() => setBuffering(false)}
      >
        <source src={product.video} type="video/mp4" />
        Tu navegador no puede reproducir este video.
      </video>
      {buffering && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          role="status"
          aria-label="Cargando video"
        >
          <span className="w-10 h-10 border-2 border-[#FF2A00] border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </div>
  );
}
