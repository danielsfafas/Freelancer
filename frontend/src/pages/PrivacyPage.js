import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container-custom">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#A3A3A3] hover:text-[#FF2A00] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-6">
              Aviso de <span className="text-[#FF2A00]">Privacidad</span>
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-[#A3A3A3] text-lg mb-8">
                Última actualización: Septiembre 2026
              </p>

              <div className="space-y-8 text-[#A3A3A3]">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. Información General</h2>
                  <p>
                    Daniel Ortega (en adelante "Dany Solutions"), con domicilio en Tepeapulco, Hidalgo, México, 
                    es responsable del tratamiento de sus datos personales.
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">Contacto:</strong><br />
                    Email: danielortegalozano@gmail.com<br />
                    Teléfono/WhatsApp: 81 1214 1456
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">2. Datos Personales Recopilados</h2>
                  <p>
                    Para las finalidades descritas en este aviso de privacidad, podemos recopilar los siguientes 
                    datos personales:
                  </p>
                  <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                    <li><strong className="text-white">Datos de identificación:</strong> Nombre completo</li>
                    <li><strong className="text-white">Datos de contacto:</strong> Correo electrónico, número de teléfono</li>
                    <li><strong className="text-white">Datos de la solicitud:</strong> Tipo de servicio, descripción del proyecto, 
                    fecha y hora preferida para consultoría</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">3. Finalidad del Tratamiento</h2>
                  <p>
                    Sus datos personales serán utilizados para las siguientes finalidades:
                  </p>
                  <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                    <li>Responder a sus consultas y solicitudes de información</li>
                    <li>Agendar y dar seguimiento a citas de consultoría</li>
                    <li>Elaborar cotizaciones y propuestas de servicios</li>
                    <li>Dar seguimiento a proyectos contratados</li>
                    <li>Enviar comunicaciones relacionadas con los servicios solicitados</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">4. Herramientas de Análisis</h2>
                  <p>
                    Este sitio web utiliza <strong className="text-white">PostHog</strong> para análisis de uso y 
                    grabación de sesiones. PostHog nos ayuda a entender cómo los visitantes interactúan con el sitio 
                    para mejorarlo.
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">IMPORTANTE:</strong> El propietario debe revisar y personalizar 
                    esta sección según la configuración real de PostHog, incluyendo:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Qué datos específicos se recopilan</li>
                    <li>Si las grabaciones de sesión están activas</li>
                    <li>Cómo pueden los usuarios optar por no participar (opt-out)</li>
                    <li>Política de retención de datos</li>
                  </ul>
                  <p className="mt-4">
                    Consulta la <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" 
                    className="text-[#FF2A00] hover:underline">Política de Privacidad de PostHog</a> para más información.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">5. Compartir Información</h2>
                  <p>
                    No compartimos, vendemos ni transferimos sus datos personales a terceros, salvo cuando sea 
                    necesario para:
                  </p>
                  <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                    <li>Cumplir con obligaciones legales</li>
                    <li>Proveer los servicios solicitados (por ejemplo, proveedores de hosting o email)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">6. Seguridad de los Datos</h2>
                  <p>
                    Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales 
                    contra acceso no autorizado, alteración, divulgación o destrucción.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">7. Sus Derechos (ARCO)</h2>
                  <p>
                    Usted tiene derecho a:
                  </p>
                  <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
                    <li><strong className="text-white">Acceder</strong> a sus datos personales</li>
                    <li><strong className="text-white">Rectificar</strong> datos incorrectos o incompletos</li>
                    <li><strong className="text-white">Cancelar</strong> sus datos personales</li>
                    <li><strong className="text-white">Oponerse</strong> al tratamiento de sus datos</li>
                  </ul>
                  <p className="mt-4">
                    Para ejercer estos derechos, envíe un correo a <a href="mailto:danielortegalozano@gmail.com" 
                    className="text-[#FF2A00] hover:underline">danielortegalozano@gmail.com</a> con el asunto 
                    "Derechos ARCO".
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
                  <p>
                    Este sitio utiliza cookies y tecnologías similares para mejorar su experiencia. Las cookies son 
                    pequeños archivos que se almacenan en su dispositivo. Puede configurar su navegador para rechazar 
                    cookies, aunque esto puede afectar la funcionalidad del sitio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">9. Cambios al Aviso de Privacidad</h2>
                  <p>
                    Nos reservamos el derecho de actualizar este aviso de privacidad. Los cambios se publicarán 
                    en esta página con la fecha de actualización correspondiente.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">10. Consentimiento</h2>
                  <p>
                    Al utilizar este sitio web y proporcionar sus datos personales a través de los formularios de 
                    contacto o agenda, usted consiente el tratamiento de sus datos conforme a este aviso de privacidad.
                  </p>
                </section>

                <div className="mt-12 p-6 border border-[#FF2A00] bg-[#141414]">
                  <p className="text-[#FF2A00] font-bold mb-2">⚠️ NOTA IMPORTANTE PARA EL PROPIETARIO</p>
                  <p className="text-sm">
                    Este aviso de privacidad es una plantilla base. Debe ser revisado y personalizado por el propietario 
                    para asegurar que cumple con:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-sm">
                    <li>La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México)</li>
                    <li>Las prácticas reales de recopilación y uso de datos del sitio</li>
                    <li>Los términos de servicio de PostHog y otras herramientas utilizadas</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Se recomienda consultar con un abogado especializado en protección de datos para asegurar el 
                    cumplimiento legal completo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
