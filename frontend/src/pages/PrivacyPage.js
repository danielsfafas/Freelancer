import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState(null);

  useEffect(() => {
    // PostHog se carga ~1 s después del evento load; reintentamos leer el estado.
    let tries = 0;
    const read = () => {
      const ph = window.posthog;
      if (ph && typeof ph.has_opted_out_capturing === 'function' && ph.__loaded) {
        setOptedOut(ph.has_opted_out_capturing());
        return;
      }
      if (tries++ < 20) timer = setTimeout(read, 500);
      else setOptedOut('unavailable');
    };
    let timer = setTimeout(read, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => {
    const ph = window.posthog;
    if (!ph) return;
    if (optedOut) {
      ph.opt_in_capturing?.();
      setOptedOut(false);
    } else {
      ph.opt_out_capturing?.();
      ph.stopSessionRecording?.();
      setOptedOut(true);
    }
  };

  if (optedOut === null) return null;

  if (optedOut === 'unavailable') {
    return (
      <p className="mt-4 text-sm text-[#525252]" data-testid="analytics-optout-unavailable">
        PostHog no se cargó en este navegador (por ejemplo, por un bloqueador), así que no se está recopilando analítica.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center min-h-[44px] px-5 border border-[#262626] hover:border-[#FF2A00] hover:text-[#FF2A00] text-white text-sm font-medium transition-colors"
        data-testid="analytics-optout-button"
      >
        {optedOut ? 'Volver a activar la analítica' : 'Desactivar analítica y grabación de sesiones'}
      </button>
      <span className="text-sm" role="status">
        {optedOut ? 'Analítica desactivada en este navegador.' : 'La analítica está activa en este navegador.'}
      </span>
    </div>
  );
}

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
                Última actualización: Octubre 2026
              </p>

              <div className="space-y-8 text-[#A3A3A3]">
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">1. Información General</h2>
                  <p>
                    Daniel Ortega, quien opera comercialmente como DanySolutions (en adelante "DanySolutions"), con domicilio en Tepeapulco, Hidalgo, México, 
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

                <section data-testid="privacy-analytics">
                  <h2 className="text-2xl font-bold text-white mb-4">4. Herramientas de Análisis</h2>
                  <p>
                    Este sitio utiliza <strong className="text-white">PostHog</strong>, un servicio de analítica
                    web proporcionado por <strong className="text-white">PostHog, Inc.</strong> (Estados Unidos). Los
                    datos de analítica se envían y almacenan en la nube de PostHog alojada en{' '}
                    <strong className="text-white">Estados Unidos</strong> (us.i.posthog.com).
                  </p>
                  <p className="mt-4"><strong className="text-white">Qué se recopila:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                    <li>
                      <strong className="text-white">Analítica de uso:</strong> páginas visitadas, clics e
                      interacciones con botones y enlaces, página de origen (referrer), tipo de navegador y
                      dispositivo, idioma, tamaño de pantalla y ubicación aproximada (país/ciudad) inferida de la
                      dirección IP.
                    </li>
                    <li>
                      <strong className="text-white">Grabación de sesiones:</strong> una reproducción de cómo se
                      navega por el sitio (movimientos, desplazamiento y clics). Los campos de formulario se
                      enmascaran, por lo que lo que escribe en ellos no queda visible en la grabación.
                    </li>
                    <li>
                      Un identificador aleatorio guardado en una cookie y en el almacenamiento local del navegador
                      para reconocer visitas repetidas. No creamos perfiles personales de visitantes anónimos ni
                      asociamos estos datos a su nombre.
                    </li>
                  </ul>
                  <p className="mt-4">
                    <strong className="text-white">Para qué:</strong> exclusivamente para entender cómo se usa el
                    sitio, detectar errores y mejorar su contenido y diseño. No se usa para publicidad ni se vende a
                    terceros.
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">Cómo desactivarlo:</strong> puede desactivar la analítica y la
                    grabación de sesiones en este navegador con el botón de abajo (la preferencia se guarda en su
                    navegador). También puede activar la opción &quot;No rastrear&quot; (Do Not Track) de su
                    navegador, bloquear cookies o usar un bloqueador de contenido.
                  </p>
                  <AnalyticsOptOut />
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
                    <li>Medir el uso del sitio mediante PostHog, en los términos de la sección 4</li>
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
                    pequeños archivos que se almacenan en su dispositivo. PostHog usa una cookie y el almacenamiento
                    local para la analítica descrita en la sección 4. Puede configurar su navegador para rechazar 
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

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
