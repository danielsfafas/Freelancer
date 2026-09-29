import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function HeroSection() {
  const { profile } = useBranding();
  const phone = profile?.phone || '+528112141456';
  const whatsappMessage = encodeURIComponent('Hola Daniel, me interesa una cotización');
  
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background Image - Optimized */}
      <div className="absolute inset-0">
        <picture>
          <source 
            type="image/webp"
            srcSet="https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=800&fm=webp&q=70&fit=crop 800w,
                    https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=1200&fm=webp&q=70&fit=crop 1200w,
                    https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=1600&fm=webp&q=70&fit=crop 1600w,
                    https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=2000&fm=webp&q=70&fit=crop 2000w"
            sizes="100vw"
          />
          <img
            src="https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=1600&fm=webp&q=70&fit=crop"
            alt="Tecnología abstracta de fondo"
            className="w-full h-full object-cover"
            fetchpriority="high"
            width="1600"
            height="900"
          />
        </picture>
        <div className="absolute inset-0 bg-[#0A0A0A]/80"></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #262626 1px, transparent 1px),
              linear-gradient(to bottom, #262626 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        <div className="max-w-4xl mx-auto">
          {/* Label */}
          <div className="animate-fade-up opacity-0 stagger-1">
            <span className="inline-block px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-[#A3A3A3] border border-[#262626] bg-[#141414]/50 backdrop-blur-sm mb-8">
              Desarrollador web · Tepeapulco Hidalgo
            </span>
          </div>

          {/* Title - No animation for LCP optimization */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-6">
            Sistemas y páginas web que te traen
            <br />
            <span className="text-[#FF2A00]">citas, pedidos y ventas</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#A3A3A3] max-w-2xl mx-auto mb-10 animate-fade-up opacity-0 stagger-2">
            Agenda en línea, pedidos por WhatsApp, punto de venta y tiendas en línea 
            para negocios de Hidalgo. <span className="text-white font-medium">+15 años de experiencia.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 stagger-3">
            <a
              href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium transition-all"
              data-testid="hero-cta-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
              Cotiza por WhatsApp
            </a>
            <a
              href="#portfolio"
              className="px-8 py-4 border border-[#262626] hover:border-[#FF2A00] text-white font-medium transition-colors"
              data-testid="hero-cta-portfolio"
            >
              Ver proyectos
            </a>
          </div>

          {/* Tech Stack - Moved lower with proper spacing */}
          <div className="mt-20 animate-fade-up opacity-0 stagger-4">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#525252] mb-6">
              Stack Tecnológico
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Angular', 'React', 'C#', 'Java', 'Arduino', 'MongoDB', 'SQL Server'].map((tech) => (
                <span
                  key={tech}
                  className="tech-tag"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Below tech stack */}
        <button
          onClick={scrollToServices}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#525252] hover:text-[#FF2A00] transition-colors animate-fade-up opacity-0 stagger-5"
          data-testid="hero-scroll-indicator"
          aria-label="Desplazarse a servicios"
        >
          <span className="text-xs font-mono uppercase tracking-widest">Explorar</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
