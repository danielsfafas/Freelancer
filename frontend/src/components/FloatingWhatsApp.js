import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useBranding } from '../context/BrandingContext';

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const { profile } = useBranding();
  const phone = profile?.phone || '+528112141456';
  const whatsappMessage = encodeURIComponent('Hola Daniel, me interesa una cotización');

  return (
    <a
      href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg transition-all duration-300 md:hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="floating-whatsapp"
      aria-label="Contactar por WhatsApp"
      style={{ minHeight: '48px', minWidth: '48px' }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-medium text-sm whitespace-nowrap">
        WhatsApp
      </span>
    </a>
  );
}
