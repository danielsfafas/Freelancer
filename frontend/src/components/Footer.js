import { Mail, Phone, MapPin, Github, Linkedin, Terminal } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              Desarrollador Full Stack especializado en crear soluciones tecnológicas 
              robustas y escalables para empresas de todos los tamaños.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/danielortega"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] transition-colors"
                data-testid="footer-github"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/danielortega"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] transition-colors"
                data-testid="footer-linkedin"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">
              Enlaces
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/#services" className="text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-sm">
                  Servicios
                </a>
              </li>
              <li>
                <a href="/#portfolio" className="text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-sm">
                  Portafolio
                </a>
              </li>
              <li>
                <a href="/#testimonials" className="text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-sm">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="/schedule" className="text-[#A3A3A3] hover:text-[#FF2A00] transition-colors text-sm">
                  Agendar Cita
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FF2A00]" />
                <a 
                  href="mailto:danielortegalozano@gmail.com"
                  className="text-[#A3A3A3] hover:text-white transition-colors text-sm"
                  data-testid="footer-email"
                >
                  danielortegalozano@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FF2A00]" />
                <span className="text-[#A3A3A3] text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FF2A00]" />
                <span className="text-[#A3A3A3] text-sm">Ciudad de México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#525252] text-sm">
            © {currentYear} Daniel Ortega. Todos los derechos reservados.
          </p>
          <p className="text-[#525252] text-sm font-mono">
            {'<'}/{'>'} Built with passion
          </p>
        </div>
      </div>
    </footer>
  );
}
