import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1762279389042-9439bfb6c155?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzU1NzAyNDR8MA&ixlib=rb-4.1.0&q=85"
          alt="Technology background"
          className="w-full h-full object-cover"
        />
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

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 animate-fade-up opacity-0 stagger-2">
            Desarrollador web e IoT
            <br />
            en <span className="text-[#FF2A00]">Tepeapulco Hidalgo</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#A3A3A3] max-w-2xl mx-auto mb-10 animate-fade-up opacity-0 stagger-3">
            Freelance full stack en el área Hidalgo: Angular, React, C#, Java y Arduino.
            Aplicaciones web, sistemas empresariales y domótica inteligente.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 stagger-4">
            <Link
              to="/schedule"
              className="group flex items-center gap-2 px-8 py-4 bg-[#FF2A00] hover:bg-[#CC2200] text-white font-medium transition-all"
              data-testid="hero-cta-schedule"
            >
              Agendar Consultoría
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#portfolio"
              className="px-8 py-4 border border-[#262626] hover:border-[#FF2A00] text-white font-medium transition-colors"
              data-testid="hero-cta-portfolio"
            >
              Ver Proyectos
            </a>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 animate-fade-up opacity-0 stagger-5">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#525252] mb-4">
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

        {/* Scroll Indicator */}
        <button
          onClick={scrollToServices}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#525252] hover:text-[#FF2A00] transition-colors animate-fade-up opacity-0 stagger-6"
          data-testid="hero-scroll-indicator"
          aria-label="Scroll to services"
        >
          <span className="text-xs font-mono uppercase tracking-widest">Explorar</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
