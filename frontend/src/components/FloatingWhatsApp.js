import { MessageCircle } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

/**
 * Botón flotante de WhatsApp (solo móvil). Es un círculo compacto de 56px
 * en la esquina, respetando el área segura del dispositivo, para tapar lo
 * menos posible. El footer deja espacio inferior extra en móvil para que el
 * botón no cubra el último contenido.
 */
export default function FloatingWhatsApp() {
  const { profile } = useBranding();
  const phone = profile?.phone || '+528112141456';
  const whatsappMessage = encodeURIComponent('Hola Daniel, me interesa una cotización');

  return (
    <a
      href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg shadow-black/40 transition-colors md:hidden"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
      data-testid="floating-whatsapp"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
