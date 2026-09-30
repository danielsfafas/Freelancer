import { Check, MessageCircle } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

// Planes aprobados el 30-sep-2026 (precios en MXN sin IVA, iguales para todos los productos).
const PRODUCTS = ['Comandix', 'MiembrosCheck', 'LigaFutbol', 'Podología', 'VentaCheck'];

const ENROLLMENT_FEE = 1000;

const PLANS = [
  {
    id: 'mensual',
    name: 'Mensual',
    waLabel: 'mensual',
    months: 1,
    price: 1000,
    perMonth: 1000,
    discount: null,
    savings: 0,
  },
  {
    id: 'trimestral',
    name: '3 meses',
    waLabel: 'de 3 meses',
    months: 3,
    price: 2700,
    perMonth: 900,
    discount: '10% de descuento',
    savings: 300,
  },
  {
    id: 'semestral',
    name: '6 meses',
    waLabel: 'de 6 meses',
    months: 6,
    price: 5100,
    perMonth: 850,
    discount: '15% de descuento',
    savings: 900,
  },
  {
    id: 'anual',
    name: '12 meses',
    waLabel: 'de 12 meses',
    months: 12,
    price: 9600,
    perMonth: 800,
    discount: '20% de descuento · 2 meses gratis',
    savings: 2400,
    featured: true,
  },
];

const mxn = (value) =>
  `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;

export default function PricingSection() {
  const { profile } = useBranding();
  const phone = (profile?.phone || '+528112141456').replace(/\D/g, '');

  const whatsappHref = (plan) => {
    const text = plan
      ? `Hola Daniel, me interesa el plan ${plan.waLabel} (${mxn(plan.price)} MXN sin IVA). ¿Me das más información?`
      : 'Hola Daniel, me interesa información sobre los planes y precios';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section
      id="pricing"
      className="section-padding bg-[#141414]"
      data-testid="pricing-section"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="label-uppercase mb-4 block">Planes y precios</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
            Un precio claro,
            <br />
            <span className="text-[#FF2A00]">sin sorpresas</span>
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Los mismos planes para todos nuestros sistemas. Entre más tiempo
            contratas, menos pagas al mes.
          </p>
        </div>

        {/* Productos incluidos */}
        <div className="mb-12" data-testid="pricing-products">
          <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-3">
            Aplica para
          </p>
          <ul className="flex flex-wrap gap-2">
            {PRODUCTS.map((product) => (
              <li key={product} className="tech-tag">
                {product}
              </li>
            ))}
          </ul>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-[#262626]">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col p-8 grid-border card-hover ${
                plan.featured ? 'bg-[#0A0A0A] outline outline-1 outline-[#FF2A00] -outline-offset-1 z-10' : 'bg-[#141414]'
              }`}
              data-testid={`pricing-card-${plan.id}`}
            >
              {plan.featured && (
                <span className="absolute top-0 right-0 bg-[#FF2A00] text-white text-xs font-mono uppercase tracking-widest px-3 py-1">
                  Mejor valor
                </span>
              )}

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-[#A3A3A3] mb-6 min-h-[1.5rem]">
                {plan.discount || 'Precio regular'}
              </p>

              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={`text-4xl lg:text-5xl font-bold tracking-tighter ${plan.featured ? 'text-[#FF2A00]' : 'text-white'}`}>
                  {mxn(plan.price)}
                </span>
                <span className="text-sm font-mono text-[#A3A3A3]">
                  MXN{plan.months === 1 ? '/mes' : ''} sin IVA
                </span>
              </div>
              <p className="text-sm text-[#A3A3A3] mb-8">
                {plan.months === 1
                  ? 'Pago mes con mes'
                  : `Equivale a ${mxn(plan.perMonth)}/mes · pago único por ${plan.months} meses`}
              </p>

              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FF2A00]" />
                  <span className="text-[#D4D4D4]">
                    {plan.savings > 0
                      ? `Ahorras ${mxn(plan.savings)} vs. pago mensual`
                      : 'Ideal para empezar'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FF2A00]" />
                  <span className="text-[#D4D4D4]">
                    Primer pago con inscripción: {mxn(plan.price + ENROLLMENT_FEE)}
                  </span>
                </li>
              </ul>

              <a
                href={whatsappHref(plan)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-6 text-sm font-medium transition-colors ${
                  plan.featured
                    ? 'bg-[#FF2A00] hover:bg-[#CC2200] text-white'
                    : 'border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] text-white'
                }`}
                aria-label={`Contratar el plan ${plan.waLabel} por WhatsApp`}
                data-testid={`pricing-cta-${plan.id}`}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                Quiero este plan
              </a>
            </article>
          ))}
        </div>

        <p className="mt-4 text-sm font-mono text-[#A3A3A3]" data-testid="pricing-tax-note">
          * Precios en MXN, sin IVA.
        </p>

        {/* Inscripción + CTA general */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-[#262626] bg-[#0A0A0A] p-6 lg:p-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2">
              Inscripción
            </p>
            <p className="text-white text-lg">
              <span className="font-bold">{mxn(ENROLLMENT_FEE)} MXN sin IVA</span>{' '}
              <span className="text-[#A3A3A3]">
                por única vez al contratar cualquier plan.
              </span>
            </p>
          </div>
          <a
            href={whatsappHref(null)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors shrink-0"
            data-testid="pricing-whatsapp-general"
          >
            <MessageCircle className="w-4 h-4" />
            ¿Dudas? Escríbeme por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
