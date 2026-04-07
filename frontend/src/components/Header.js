import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code2, Terminal } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/#services', label: 'Servicios' },
    { href: '/#portfolio', label: 'Portafolio' },
    { href: '/#testimonials', label: 'Testimonios' },
    { href: '/#contact', label: 'Contacto' },
    { href: '/schedule', label: 'Agendar' },
  ];

  const isActive = (href) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.substring(1);
    }
    return location.pathname === href;
  };

  const handleNavClick = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('/#')) {
      const element = document.getElementById(href.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 glass"
      data-testid="main-header"
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            data-testid="header-logo"
          >
            <div className="w-10 h-10 flex items-center justify-center border border-[#262626] bg-[#141414] group-hover:border-[#FF2A00] transition-colors">
              <Terminal className="w-5 h-5 text-[#FF2A00]" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Daniel<span className="text-[#FF2A00]">.</span>Ortega
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium transition-colors hover:text-[#FF2A00] ${
                  isActive(link.href) ? 'text-[#FF2A00]' : 'text-[#A3A3A3]'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-medium border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] transition-colors"
              data-testid="nav-link-admin"
            >
              <Code2 className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#A3A3A3] hover:text-white"
            data-testid="mobile-menu-button"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden py-4 border-t border-[#262626] animate-fade-in"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-base font-medium transition-colors hover:text-[#FF2A00] ${
                    isActive(link.href) ? 'text-[#FF2A00]' : 'text-[#A3A3A3]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-base font-medium text-[#A3A3A3] hover:text-[#FF2A00] transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
