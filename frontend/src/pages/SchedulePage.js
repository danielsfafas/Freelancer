import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const serviceTypes = [
  { value: 'web', label: 'Desarrollo Web' },
  { value: 'domotica', label: 'Domótica / IoT' },
  { value: 'enterprise', label: 'Sistemas Empresariales' },
  { value: 'database', label: 'Bases de Datos' },
  { value: 'consulting', label: 'Consultoría General' },
];

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00',
];

export default function SchedulePage() {
  const [date, setDate] = useState(undefined);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    preferred_time: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date) {
      toast.error('Por favor selecciona una fecha');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/appointments`, {
        ...formData,
        preferred_date: format(date, 'yyyy-MM-dd'),
      });
      setSuccess(true);
      toast.success('¡Cita agendada exitosamente!');
    } catch (error) {
      toast.error('Error al agendar la cita. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Disable past dates
  const disabledDays = { before: new Date() };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      
      <main className="pt-20 md:pt-24">
        {/* Hero */}
        <section className="py-16 md:py-20 border-b border-[#262626]">
          <div className="container-custom">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors mb-8"
              data-testid="schedule-back-link"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
              Agenda una <span className="text-[#FF2A00]">consultoría</span>
            </h1>
            <p className="text-[#A3A3A3] text-lg max-w-2xl">
              Selecciona una fecha y hora conveniente para una llamada de consultoría 
              donde podamos discutir tu proyecto.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="container-custom">
            {success ? (
              <div 
                className="max-w-2xl mx-auto text-center py-20 animate-fade-up"
                data-testid="schedule-success"
              >
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-[#FF2A00] rounded-full">
                  <CalendarIcon className="w-10 h-10 text-[#FF2A00]" />
                </div>
                <h2 className="text-3xl font-bold mb-4">¡Cita Agendada!</h2>
                <p className="text-[#A3A3A3] mb-8">
                  Recibirás un email de confirmación con los detalles de tu cita.
                  Me pondré en contacto contigo pronto.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF2A00] hover:bg-[#CC2200] text-white transition-colors"
                >
                  Volver al Inicio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Calendar */}
                <div className="bg-[#141414] border border-[#262626] p-6 lg:p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-[#FF2A00]" />
                    Selecciona una fecha
                  </h3>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={disabledDays}
                      locale={es}
                      className="rounded-none border-none bg-transparent"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-white",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border border-[#262626] hover:border-[#FF2A00]",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-[#A3A3A3] rounded-md w-10 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 text-center text-sm p-0 relative",
                        day: "h-10 w-10 p-0 font-normal text-white hover:bg-[#262626] transition-colors",
                        day_selected: "bg-[#FF2A00] text-white hover:bg-[#CC2200] focus:bg-[#FF2A00]",
                        day_today: "border border-[#FF2A00] text-[#FF2A00]",
                        day_outside: "text-[#525252] opacity-50",
                        day_disabled: "text-[#525252] opacity-30",
                        day_hidden: "invisible",
                      }}
                      data-testid="schedule-calendar"
                    />
                  </div>
                  
                  {date && (
                    <div className="mt-6 p-4 border border-[#262626] bg-[#0A0A0A]">
                      <p className="text-sm text-[#A3A3A3]">Fecha seleccionada:</p>
                      <p className="text-lg font-bold text-[#FF2A00]">
                        {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="bg-[#141414] border border-[#262626] p-6 lg:p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#FF2A00]" />
                    Completa tus datos
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="schedule-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                          Nombre *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Tu nombre completo"
                          className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                          data-testid="schedule-input-name"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                          Email *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="tu@email.com"
                          className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                          data-testid="schedule-input-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                          Teléfono *
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+52 555 123 4567"
                          className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                          data-testid="schedule-input-phone"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                          Hora Preferida *
                        </label>
                        <Select
                          value={formData.preferred_time}
                          onValueChange={(value) => handleSelectChange('preferred_time', value)}
                          required
                        >
                          <SelectTrigger 
                            className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                            data-testid="schedule-select-time"
                          >
                            <SelectValue placeholder="Selecciona hora" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#262626]">
                            {timeSlots.map((time) => (
                              <SelectItem 
                                key={time} 
                                value={time}
                                className="text-white hover:bg-[#262626] focus:bg-[#262626]"
                              >
                                {time} hrs
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                        Tipo de Servicio *
                      </label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => handleSelectChange('service_type', value)}
                        required
                      >
                        <SelectTrigger 
                          className="bg-[#0A0A0A] border-[#262626] text-white focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none"
                          data-testid="schedule-select-service"
                        >
                          <SelectValue placeholder="Selecciona tipo de servicio" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#262626]">
                          {serviceTypes.map((service) => (
                            <SelectItem 
                              key={service.value} 
                              value={service.value}
                              className="text-white hover:bg-[#262626] focus:bg-[#262626]"
                            >
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-mono uppercase tracking-widest text-[#525252] mb-2 block">
                        Descripción del Proyecto *
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Cuéntame brevemente sobre tu proyecto o lo que deseas discutir..."
                        rows={4}
                        className="bg-[#0A0A0A] border-[#262626] text-white placeholder:text-[#525252] focus:border-[#FF2A00] focus:ring-[#FF2A00] rounded-none resize-none"
                        data-testid="schedule-input-description"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !date}
                      className="w-full bg-[#FF2A00] hover:bg-[#CC2200] text-white font-medium py-6 rounded-none transition-colors disabled:opacity-50"
                      data-testid="schedule-submit-button"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Agendando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Confirmar Cita
                          <Send className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
