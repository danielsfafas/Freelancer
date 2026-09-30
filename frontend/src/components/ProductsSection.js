import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductVideo, { PRODUCT_ICONS } from './ProductVideo';

export default function ProductsSection() {
  return (
    <section
      id="productos"
      className="section-padding bg-[#0A0A0A]"
      data-testid="products-section"
    >
      <div className="container-custom">
        <div className="max-w-2xl mb-12">
          <span className="label-uppercase mb-4 block">Productos</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
            Sistemas listos
            <br />
            <span className="text-[#FF2A00]">para tu negocio</span>
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Sistemas que ya funcionan en negocios de la región. Elige tu giro
            y conoce todo lo que incluye.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {PRODUCTS.map((product) => {
            const Icon = PRODUCT_ICONS[product.slug];
            const to = `/productos/${product.slug}`;
            return (
              <article
                key={product.slug}
                className="group flex flex-col sm:flex-row gap-6 p-6 bg-[#141414] border border-[#262626] hover:border-[#FF2A00] transition-colors"
                data-testid={`product-card-${product.slug}`}
              >
                <div className={`w-full mx-auto sm:mx-0 sm:w-[180px] shrink-0 ${product.video ? 'max-w-[220px]' : ''}`}>
                  <ProductVideo product={product} />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center border border-[#262626] group-hover:border-[#FF2A00] transition-colors">
                      {Icon && <Icon className="w-5 h-5 text-[#FF2A00]" />}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      <Link to={to} className="hover:text-[#FF2A00] transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                  </div>
                  <p className="text-[#A3A3A3] mb-5">{product.tagline}</p>

                  <ul className="space-y-2 mb-6 text-sm">
                    {product.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FF2A00]" />
                        <span className="text-[#D4D4D4]">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-center gap-4">
                    <Link
                      to={to}
                      className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[#FF2A00] hover:bg-[#CC2200] text-white text-sm font-medium transition-colors"
                      data-testid={`product-link-${product.slug}`}
                    >
                      Ver funcionalidades
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="/#pricing"
                      className="inline-flex items-center min-h-[48px] text-sm text-[#A3A3A3] hover:text-[#FF2A00] transition-colors"
                    >
                      Ver precios
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
