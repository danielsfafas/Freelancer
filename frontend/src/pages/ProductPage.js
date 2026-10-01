import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Gift, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import ProductVideo, { PRODUCT_ICONS } from '../components/ProductVideo';
import { useBranding, DEFAULT_PAGE_TITLE } from '../context/BrandingContext';
import { PRODUCTS, getProduct, whatsappProductHref } from '../data/products';
import NotFoundPage from './NotFoundPage';

function setMetaDescription(content) {
  let tag = document.querySelector("meta[name='description']");
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }
  const previous = tag.getAttribute('content');
  tag.setAttribute('content', content);
  return previous;
}

export default function ProductPage() {
  const { slug } = useParams();
  const product = getProduct(slug);
  const { profile } = useBranding();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!product) return undefined;
    // BrandingProvider fija el título al cargar el perfil; lo aplicamos después.
    const timer = setTimeout(() => {
      document.title = `${product.name}: funcionalidades | Dany Solutions`;
    }, 0);
    const previousDescription = setMetaDescription(`${product.name}: ${product.tagline}`);
    return () => {
      clearTimeout(timer);
      document.title = profile?.name?.trim()
        ? `${profile.name.trim()} | Desarrollador web Tepeapulco Hidalgo`
        : DEFAULT_PAGE_TITLE;
      if (previousDescription) setMetaDescription(previousDescription);
    };
  }, [product, profile]);

  if (!product) return <NotFoundPage />;

  const Icon = PRODUCT_ICONS[product.slug];
  const whatsappHref = whatsappProductHref(profile?.phone, product);
  const others = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid={`product-page-${product.slug}`}>
      <Header />

      <main className="pt-24 md:pt-28">
        {/* Hero */}
        <section className="pb-16 md:pb-24">
          <div className="container-custom">
            <Link
              to="/#productos"
              className="inline-flex items-center gap-2 min-h-[44px] text-[#A3A3A3] hover:text-[#FF2A00] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Todos los productos
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center border border-[#262626]">
                    {Icon && <Icon className="w-6 h-6 text-[#FF2A00]" />}
                  </div>
                  <span className="label-uppercase">Producto DanySolutions</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
                  {product.name}
                </h1>
                <p className="text-xl sm:text-2xl text-white mb-6 max-w-2xl">{product.tagline}</p>

                {product.trial && (
                  <p
                    className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border border-[#FF2A00] text-[#FF2A00] text-xs font-mono uppercase tracking-widest"
                    data-testid="product-trial"
                  >
                    <Gift className="w-3.5 h-3.5 shrink-0" />
                    {product.trial}
                  </p>
                )}

                <div className="border-l-2 border-[#FF2A00] pl-4 mb-10 max-w-2xl">
                  <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-1">
                    Para quién es
                  </p>
                  <p className="text-[#A3A3A3]">{product.audience}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors"
                    data-testid="product-whatsapp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Pedir demo por WhatsApp
                  </a>
                  <Link
                    to="/#pricing"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] text-white text-sm font-medium transition-colors"
                    data-testid="product-pricing-link"
                  >
                    Ver planes y precios
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {product.reference && (
                  <p className="text-sm text-[#A3A3A3]">
                    En uso:{' '}
                    <a
                      href={product.reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white hover:text-[#FF2A00] transition-colors"
                    >
                      {product.reference.label}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </p>
                )}
              </div>

              <div className="w-full max-w-[320px] mx-auto lg:mx-0">
                <ProductVideo product={product} />
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="section-padding bg-[#141414]" data-testid="product-features">
          <div className="container-custom">
            <div className="max-w-2xl mb-12">
              <span className="label-uppercase mb-4 block">Funcionalidades</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">
                Todo lo que incluye <span className="text-[#FF2A00]">{product.name}</span>
              </h2>
            </div>

            <div className="space-y-12">
              {product.groups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-4">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-[#262626]">
                    {group.features.map((feature) => (
                      <div key={feature.title} className="p-6 lg:p-8 grid-border bg-[#0A0A0A]">
                        <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                        <p className="text-[#A3A3A3] text-sm leading-relaxed">{feature.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {product.notes && (
              <p className="mt-8 text-sm font-mono text-[#A3A3A3]">* {product.notes}</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-[#0A0A0A]">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-[#262626] bg-[#141414] p-8 lg:p-12">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter mb-3">
                  ¿Quieres ver {product.name} en tu negocio?
                </h2>
                <p className="text-[#A3A3A3]">
                  {product.trial && <>Incluye {product.trial}. </>}
                  Desde $800 MXN al mes en el plan de 12 meses, más $1,000 de inscripción.
                  Precios en MXN, sin IVA.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escríbeme por WhatsApp
                </a>
                <Link
                  to="/#pricing"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#FF2A00] hover:bg-[#CC2200] text-white text-sm font-medium transition-colors"
                >
                  Ver planes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Otros productos */}
            <div className="mt-16">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-4">
                Otros productos
              </h2>
              <div className="flex flex-wrap gap-2">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/productos/${p.slug}`}
                    className="tech-tag inline-flex items-center min-h-[44px]"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
