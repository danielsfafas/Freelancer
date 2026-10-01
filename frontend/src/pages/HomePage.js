import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import PortfolioSection from '../components/PortfolioSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ProductsSection from '../components/ProductsSection';
import PricingSection from '../components/PricingSection';
import ContactSection from '../components/ContactSection';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function HomePage() {
  const { hash } = useLocation();

  // Al llegar desde otra página con /#seccion, desplazarse a esa sección.
  useEffect(() => {
    if (!hash) return undefined;
    const scroll = (behavior) =>
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior });
    // Segundo intento: el portafolio carga después y puede mover la posición.
    const first = setTimeout(() => scroll('smooth'), 150);
    const second = setTimeout(() => scroll('auto'), 1200);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [hash]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="home-page">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <ProductsSection />
        <PricingSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
