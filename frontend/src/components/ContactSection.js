import { useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '../lib/apiBase';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      toast.success('¡Mensaje enviado exitosamente!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="section-padding bg-[#141414]"
      data-testid="contact-section"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Info */}
          <div>
            <span className="label-uppercase mb-4 block">Contacto</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
              ¿Tienes un proyecto
              <br />
              <span className="text-[#FF2A00]">en mente?</span>
            </h2>
            <p className="text-[#A3A3A3] text-lg mb-10">
              Escríbeme desde Tepeapulco Hidalgo o cualquier parte del área Hidalgo
              y conversemos cómo materializar tu proyecto en soluciones tecnológicas.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-[#262626]">
                  <Mail className="w-5 h-5 text-[#FF2A00]" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-1">Email</p>
                  <a 
                    href="mailto:danielortegalozano@gmail.com"
                    className="text-white hover:text-[#FF2A00] transition-colors"
                    data-testid="contact-email"
                  >
                    danielortegalozano@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-[#262626]">
                  <Phone className="w-5 h-5 text-[#FF2A00]" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-1">Teléfono</p>
                  <span className="text-white">+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center border border-[#262626]">
                  <MapPin className="w-5 h-5 text-[#FF2A00]" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-1">Ubicación</p>
                  <span className="text-white">Tepeapulco, Hidalgo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#0A0A0A] border border-[#262626] p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Nombre
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className="bg-[#141414] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                  data-testid="contact-input-name"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="bg-[#141414] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                  data-testid="contact-input-email"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                  Mensaje
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Cuéntame sobre tu proyecto..."
                  rows={5}
                  className="bg-[#141414] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none resize-none"
                  data-testid="contact-input-message"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF2A00] hover:bg-[#CC2200] text-white font-medium py-6 rounded-none transition-colors"
                data-testid="contact-submit-button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enviar Mensaje
                    <Send className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
