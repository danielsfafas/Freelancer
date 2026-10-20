import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DEFAULT_PAGE_TITLE } from '../context/BrandingContext';

// Mismos datos de identidad y contacto que el Aviso de privacidad (/privacidad).
const CONTACT_EMAIL = 'danielortegalozano@gmail.com';
const CONTACT_PHONE = '81 1214 1456';

const PLANS = [
  ['Mensual', '$1,000 MXN por mes'],
  ['3 meses', '$2,700 MXN (equivale a $900/mes)'],
  ['6 meses', '$5,100 MXN (equivale a $850/mes)'],
  ['12 meses', '$9,600 MXN (equivale a $800/mes)'],
];

function Section({ n, title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

const ul = 'list-disc list-inside mt-4 space-y-2 ml-4';
const strong = 'text-white';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      document.title = 'Términos y condiciones | DanySolutions';
    }, 0);
    return () => {
      clearTimeout(timer);
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="terms-page">
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
              Términos y <span className="text-[#FF2A00]">condiciones</span>
            </h1>

            <p className="text-[#A3A3A3] text-lg mb-8">Última actualización: Octubre 2026</p>

            <div className="space-y-8 text-[#A3A3A3]">
              <Section n={1} title="Identificación del proveedor">
                <p>
                  Estos términos regulan la contratación de los servicios ofrecidos por Daniel Ortega, quien opera
                  comercialmente como <strong className={strong}>DanySolutions</strong> (en adelante
                  &quot;DanySolutions&quot; o &quot;el proveedor&quot;), con domicilio en Tepeapulco, Hidalgo, México.
                </p>
                <p className="mt-4">
                  <strong className={strong}>Contacto:</strong>
                  <br />
                  Email: {CONTACT_EMAIL}
                  <br />
                  Teléfono/WhatsApp: {CONTACT_PHONE}
                </p>
              </Section>

              <Section n={2} title="Aceptación">
                <p>
                  Al contratar cualquier plan o servicio, crear una cuenta o usar los sistemas de DanySolutions, el
                  cliente acepta estos términos y el{' '}
                  <Link to="/privacidad" className="text-[#FF2A00] hover:underline">
                    Aviso de privacidad
                  </Link>
                  . Si una cotización o contrato firmado establece condiciones distintas, prevalece lo acordado en
                  ese documento.
                </p>
              </Section>

              <Section n={3} title="Servicios">
                <ul className={ul}>
                  <li>
                    <strong className={strong}>Sistemas en suscripción (software como servicio):</strong> Comandix,
                    MiembrosCheck, LigaFutbol, Podología y VentaCheck. El cliente obtiene acceso en línea al sistema
                    mientras su plan esté vigente; DanySolutions se encarga del hospedaje, las actualizaciones y el
                    mantenimiento.
                  </li>
                  <li>
                    <strong className={strong}>Desarrollo a medida:</strong> páginas y sistemas web, IoT, integraciones
                    y consultoría. El alcance, precio, entregables y tiempos se definen en la cotización aceptada por
                    el cliente.
                  </li>
                </ul>
              </Section>

              <Section n={4} title="Planes, precios e impuestos">
                <p>Los sistemas en suscripción se contratan con los siguientes planes:</p>
                <ul className={ul}>
                  <li>
                    <strong className={strong}>Inscripción:</strong> $1,000 MXN, por única vez al contratar cualquier
                    plan.
                  </li>
                  {PLANS.map(([name, price]) => (
                    <li key={name}>
                      <strong className={strong}>Plan {name}:</strong> {price}, pago por adelantado.
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  Todos los precios están expresados en pesos mexicanos y{' '}
                  <strong className={strong}>no incluyen IVA</strong>, que se agregará cuando corresponda conforme a
                  la ley. Los planes de 3, 6 y 12 meses son prepagos por todo el periodo. DanySolutions puede
                  modificar sus precios avisando con al menos 30 días de anticipación; el cambio no afecta periodos
                  ya pagados.
                </p>
              </Section>

              <Section n={5} title="Periodo de prueba">
                <p>
                  Únicamente <strong className={strong}>LigaFutbol</strong> incluye{' '}
                  <strong className={strong}>14 días de prueba gratis</strong>, sin cargo. Al terminar la prueba, para
                  seguir usando el sistema el cliente debe pagar la inscripción y el plan elegido; de lo contrario, la
                  cuenta se suspende. Los demás sistemas no incluyen periodo de prueba, aunque se puede solicitar una
                  demostración por WhatsApp.
                </p>
              </Section>

              <Section n={6} title="Pagos">
                <ul className={ul}>
                  <li>Los pagos se realizan por adelantado, al inicio de cada periodo contratado, por los medios que DanySolutions indique (por ejemplo, transferencia o depósito bancario).</li>
                  <li>Si un pago no se recibe en la fecha de renovación, DanySolutions avisará al cliente y podrá suspender el acceso al sistema 5 días naturales después del aviso. El servicio se reactiva al regularizar el pago.</li>
                  <li>En desarrollo a medida, los pagos (anticipo y parcialidades) se rigen por la cotización aceptada.</li>
                  <li>Las comisiones de servicios de terceros que el cliente contrate por su cuenta (por ejemplo, Mercado Pago, Facturapi, paquetería o WhatsApp) corren a cargo del cliente.</li>
                </ul>
              </Section>

              <Section n={7} title="Renovación y cancelación">
                <ul className={ul}>
                  <li>El cliente puede cancelar en cualquier momento avisando por WhatsApp o correo electrónico. La cancelación surte efecto al terminar el periodo ya pagado y no hay penalización.</li>
                  <li>La inscripción y los periodos prepagados no son reembolsables, salvo cuando el servicio no pueda prestarse por causas atribuibles a DanySolutions o cuando la ley aplicable lo exija.</li>
                  <li>Hasta 30 días naturales después de la cancelación, el cliente puede solicitar una exportación de su información. Pasado ese plazo, los datos podrán eliminarse de forma definitiva.</li>
                  <li>DanySolutions puede suspender o cancelar una cuenta que se use para fines ilícitos o en violación de estos términos.</li>
                </ul>
              </Section>

              <Section n={8} title="Soporte y disponibilidad">
                <ul className={ul}>
                  <li>El soporte se brinda por WhatsApp ({CONTACT_PHONE}) y correo ({CONTACT_EMAIL}) en días y horario hábiles. Se atienden dudas de uso, fallas y configuración del sistema contratado.</li>
                  <li>DanySolutions hace esfuerzos razonables para que los sistemas estén disponibles de forma continua, pero no garantiza un servicio libre de interrupciones. Los mantenimientos programados se avisarán con anticipación cuando sea posible.</li>
                  <li>Los nuevos desarrollos, cambios a la medida o capacitaciones fuera del uso normal pueden cotizarse por separado.</li>
                </ul>
              </Section>

              <Section n={9} title="Obligaciones del cliente">
                <ul className={ul}>
                  <li>Proporcionar información veraz y mantener la confidencialidad de sus usuarios y contraseñas.</li>
                  <li>Usar los sistemas conforme a la ley y no intentar vulnerar su seguridad ni revenderlos sin autorización.</li>
                  <li>Contar con su propio aviso de privacidad y con el consentimiento necesario para los datos de sus clientes, pacientes, alumnos o jugadores que capture en el sistema.</li>
                </ul>
              </Section>

              <Section n={10} title="Datos del cliente">
                <p>
                  La información que el cliente captura en el sistema le pertenece. DanySolutions la trata únicamente
                  para prestar el servicio, la resguarda con medidas de seguridad razonables y no la vende ni la
                  comparte con terceros, salvo con los proveedores necesarios para operar el servicio (por ejemplo,
                  hospedaje) o cuando la ley lo exija. Los datos personales recabados a través de este sitio se tratan
                  conforme al{' '}
                  <Link to="/privacidad" className="text-[#FF2A00] hover:underline">
                    Aviso de privacidad
                  </Link>
                  .
                </p>
              </Section>

              <Section n={11} title="Propiedad intelectual">
                <ul className={ul}>
                  <li>
                    <strong className={strong}>Sistemas en suscripción:</strong> el software, su código, diseño y las
                    marcas Comandix, MiembrosCheck, LigaFutbol, VentaCheck y DanySolutions son propiedad de Daniel
                    Ortega. La suscripción otorga una licencia de uso no exclusiva e intransferible, vigente mientras
                    el plan esté pagado; no transfiere la propiedad del software.
                  </li>
                  <li>
                    <strong className={strong}>Desarrollo a medida:</strong> salvo que la cotización diga otra cosa,
                    una vez cubierto el pago total el cliente recibe los derechos de uso de los entregables creados
                    específicamente para él. DanySolutions conserva la propiedad de sus herramientas, componentes y
                    código reutilizable preexistentes, que podrá seguir usando en otros proyectos.
                  </li>
                  <li>Los logotipos, textos, fotos y demás contenido que aporte el cliente siguen siendo suyos.</li>
                  <li>DanySolutions podrá mencionar el proyecto en su portafolio, salvo que el cliente lo pida por escrito.</li>
                </ul>
              </Section>

              <Section n={12} title="Limitación de responsabilidad">
                <ul className={ul}>
                  <li>Los sistemas se ofrecen tal como están disponibles. DanySolutions no es responsable por daños indirectos, lucro cesante o pérdida de ventas derivados del uso o la imposibilidad de usar los sistemas.</li>
                  <li>La responsabilidad total de DanySolutions frente al cliente se limita al monto pagado por el cliente en los 3 meses anteriores al hecho que la origine.</li>
                  <li>DanySolutions no responde por fallas de servicios de terceros (por ejemplo, WhatsApp, proveedores de pago, facturación, internet o energía eléctrica) ni por casos fortuitos o de fuerza mayor.</li>
                  <li>Nada de lo anterior limita los derechos que la Ley Federal de Protección al Consumidor u otras leyes otorguen al cliente y que no puedan renunciarse.</li>
                </ul>
              </Section>

              <Section n={13} title="Cambios a estos términos">
                <p>
                  DanySolutions puede actualizar estos términos. Los cambios se publicarán en esta página con la fecha
                  de actualización y, si afectan a clientes con un plan vigente, se les avisará por WhatsApp o correo.
                </p>
              </Section>

              <Section n={14} title="Legislación aplicable y jurisdicción">
                <p>
                  Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia,
                  las partes se someten a los tribunales competentes del Estado de Hidalgo, México, renunciando a
                  cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro, sin
                  perjuicio de los derechos que la ley otorga a los consumidores ante la PROFECO.
                </p>
              </Section>

              <Section n={15} title="Contacto">
                <p>
                  Para dudas sobre estos términos, escriba a{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#FF2A00] hover:underline">
                    {CONTACT_EMAIL}
                  </a>{' '}
                  o por WhatsApp al {CONTACT_PHONE}.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
