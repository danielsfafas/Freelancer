import { Mail, Phone, MapPin, Github, Linkedin, Terminal, MessageCircle } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { profile } = useBranding();
  const phone = profile?.phone || '+528112141456';
  const phoneDisplay = phone.replace(/^\+52/, '').replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
  const whatsappMessage = encodeURIComponent('Hola Daniel, me interesa una cotización');

  return (
    <footer 
      className="bg-[#0A0A0A] border-t border-[#262626]"
      data-testid="main-footer"
    >
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center border border-[#262626] bg-[#141414]">
                <Terminal className="w-5 h-5 text-[#FF2A00]" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Daniel<span className="text-[#FF2A00]">.</span>Ortega
              </span>
            </div>
            <p className="text-[#A3A3A3] text-sm leading-relaxed mb-6">
              Desarrollador web e IoT en Tepeapulco Hidalgo. Soluciones full stack
              robustas y escalables para empresas del área Hidalgo y todo México.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/danielortega"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] transition-colors"
                data-testid="footer-github"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/in/danielortega"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] transition-colors"
                data-testid="footer-linkedin"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">
              Enlaces
            </h2>
            <ul className="space-y-3">
              <li>
                <a href="/#services" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Servicios
                </a>
              </li>
              <li>
                <a href="/#productos" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Productos
                </a>
              </li>
              <li>
                <a href="/#portfolio" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Portafolio
                </a>
              </li>
              <li>
                <a href="/#pricing" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Planes y precios
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="/schedule" className="inline-block py-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-base">
                  Agendar Cita
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">
              Contacto
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#FF2A00]" />
                <a 
                  href="mailto:danielortegalozano@gmail.com"
                  className="inline-block py-2 text-[#A3A3A3] hover:text-white transition-colors text-base"
                  data-testid="footer-email"
                >
                  danielortegalozano@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#FF2A00]" />
                <a 
                  href={`tel:${phone}`}
                  className="inline-block py-2 text-[#A3A3A3] hover:text-white transition-colors text-base"
                  data-testid="footer-phone"
                >
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#FF2A00]" />
                <a 
                  href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-2 text-[#A3A3A3] hover:text-white transition-colors text-base"
                  data-testid="footer-whatsapp"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FF2A00]" />
                <span className="text-[#A3A3A3] text-sm">Tepeapulco, Hidalgo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#525252] text-sm">
            © {currentYear} Daniel Ortega. Todos los derechos reservados.
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center text-[#525252] text-sm">
            <a href="/privacidad" className="hover:text-white transition-colors">
              Aviso de privacidad
            </a>
            <p className="font-mono">
              Hecho con pasión en Hidalgo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
