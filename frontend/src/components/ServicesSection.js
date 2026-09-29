import { useEffect, useState } from 'react';
import { Globe, Home, Building2, Database, Users } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../lib/apiBase';

const iconMap = {
  globe: Globe,
  home: Home,
  building: Building2,
  database: Database,
  users: Users,
};

const defaultServices = [
  { id: '1', title: 'Desarrollo Web', description: 'Aplicaciones web modernas con Angular y React', icon: 'globe' },
  { id: '2', title: 'Domótica', description: 'Soluciones IoT con Arduino', icon: 'home' },
  { id: '3', title: 'Sistemas Empresariales', description: 'Software robusto con C# y Java', icon: 'building' },
  { id: '4', title: 'Bases de Datos', description: 'SQL Server, MySQL, PostgreSQL, MongoDB', icon: 'database' },
  { id: '5', title: 'Consultoría', description: 'Asesoramiento técnico especializado', icon: 'users' },
];

export default function ServicesSection() {
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/services`);
        if (response.data && response.data.length > 0) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  return (
    <section 
      id="services" 
      className="section-padding bg-[#0A0A0A]"
      data-testid="services-section"
    >
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="label-uppercase mb-4 block">Servicios</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
            Soluciones tecnológicas
            <br />
            <span className="text-[#FF2A00]">a tu medida</span>
          </h2>
          <p className="text-[#A3A3A3] text-lg">
            Desarrollo web, IoT y consultoría full stack desde Tepeapulco Hidalgo
            (área Hidalgo): software a medida, automatización y asesoría técnica.
          </p>
        </div>

        {/* Services Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-[#262626] ${
          services.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3'
        }`}>
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Globe;
            return (
              <div
                key={service.id}
                className="group p-8 lg:p-12 grid-border card-hover animate-fade-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                data-testid={`service-card-${index}`}
              >
                <div className="w-12 h-12 flex items-center justify-center border border-[#262626] group-hover:border-[#FF2A00] transition-colors mb-6">
                  <IconComponent className="w-6 h-6 text-[#FF2A00]" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#FF2A00] transition-colors">
                  {service.title}
                </h3>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
