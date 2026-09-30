// Productos de DanySolutions. Solo funcionalidades verificadas en el código o en el sitio en vivo
// (inventario completo en research/web_productos/funcionalidades.md, 30-sep-2026).
// Mismos planes para todos los productos: ver PricingSection (#pricing).

const VIDEO_BASE = '/videos/productos';

export const PRODUCTS = [
  {
    slug: 'comandix',
    name: 'Comandix',
    tagline: 'El punto de venta para restaurantes y taquerías: de la comanda al corte de caja.',
    audience:
      'Restaurantes, taquerías y negocios de comida que atienden en mesa, para llevar y a domicilio por WhatsApp.',
    highlights: ['Comanda y cocina en tiempo real', 'QR en mesa y bot de WhatsApp', 'Caja, repartidores e inventario'],
    video: `${VIDEO_BASE}/comandix.mp4`,
    poster: `${VIDEO_BASE}/comandix-poster.jpg`,
    reference: { label: 'Tacos Taquicardia, Cd. Sahagún', url: 'https://taquicardia.danysolutions.online/' },
    groups: [
      {
        title: 'Servicio en mesa',
        features: [
          { title: 'Comanda digital', text: 'El mesero arma el pedido por mesa o para llevar, con notas para cocina, y lo envía en un toque.' },
          { title: 'QR en cada mesa', text: 'Tu cliente pide desde su celular, ve su cuenta y puede pagar con Mercado Pago, con propina.' },
          { title: 'Cocina y barra en tiempo real', text: 'Pantallas con el tiempo de cada pedido, aviso con sonido y comanda impresa por estación.' },
        ],
      },
      {
        title: 'Pedidos a domicilio',
        features: [
          { title: 'Bot de pedidos por WhatsApp', text: 'Toma pedidos con tu menú y tu horario, da la hora estimada y acepta efectivo, transferencia o link de pago.' },
          { title: 'Repartidores y entregas', text: 'Ofrece el pedido a tus repartidores por WhatsApp, con costo por kilómetro, ruta en Google Maps y entrega confirmada por QR.' },
        ],
      },
      {
        title: 'Caja y control',
        features: [
          { title: 'Caja y corte', text: 'Abre caja con fondo, cobra en efectivo, tarjeta o SPEI y cierra con esperado contra contado.' },
          { title: 'Inventario', text: 'Insumos con stock mínimo y alertas, y bebidas por pieza que se ocultan solas al agotarse.' },
          { title: 'Reportes de ventas', text: 'Ingresos por periodo, ticket promedio, métodos de pago y platillos más vendidos.' },
          { title: 'Impresora térmica', text: 'Tickets y comandas por Bluetooth en papel de 58 u 80 mm, con tu logo (desde Chrome).' },
        ],
      },
      {
        title: 'Tu marca',
        features: [
          { title: 'Sitio web con tu menú', text: 'Menú con buscador, promociones, horarios y mapa, con tus colores y tu logo.' },
        ],
      },
    ],
  },
  {
    slug: 'miembroscheck',
    name: 'MiembrosCheck',
    tagline: 'Control de alumnos, pagos y asistencia para gimnasios y academias.',
    audience:
      'Gimnasios, boxes y academias de artes marciales, baile, música o idiomas: cualquier negocio que cobra mensualidades por clases.',
    highlights: ['Semáforo de pagos', 'Asistencia con reconocimiento facial', 'Portal del alumno y sitio web'],
    video: `${VIDEO_BASE}/miembroscheck.mp4`,
    poster: `${VIDEO_BASE}/miembroscheck-poster.jpg`,
    reference: { label: 'Morales Box, Tepeapulco', url: 'https://moralesbox.danysolutions.online/' },
    groups: [
      {
        title: 'Alumnos',
        features: [
          { title: 'Expediente de cada alumno', text: 'Datos, foto, carta responsiva, progreso físico con gráficas, galería e historial.' },
          { title: 'Portal del alumno', text: 'Cada alumno entra con su usuario a consultar su perfil, su progreso y sus pagos.' },
        ],
      },
      {
        title: 'Cobranza',
        features: [
          { title: 'Semáforo de pagos', text: 'Ve de un vistazo quién está al corriente, por vencer o vencido.' },
          { title: 'Cobros en efectivo o transferencia', text: 'Registra pagos, confirma transferencias y consulta el historial de cada alumno.' },
          { title: 'Paquetes y horarios', text: 'Mensual, trimestral, anual o a tu medida, con turnos y ofertas con cuenta regresiva.' },
        ],
      },
      {
        title: 'Asistencia',
        features: [
          { title: 'Kiosco con reconocimiento facial', text: 'El alumno registra su entrada con su cara o por nombre, y el sistema avisa si tiene adeudo.' },
        ],
      },
      {
        title: 'Tu negocio',
        features: [
          { title: 'Dashboard', text: 'Alumnos activos, ingresos del mes, vencidos, renovaciones y asistencias de la semana.' },
          { title: 'Sitio web editable', text: 'Tu página con paquetes, productos, eventos y contacto, con cinco temas de diseño.' },
          { title: 'Varias sucursales', text: 'Cada sucursal con su propio administrador.' },
        ],
      },
    ],
  },
  {
    slug: 'ligafutbol',
    name: 'LigaFutbol',
    tagline: 'Organiza tu liga de principio a fin: calendario, cobros, árbitros y resultados.',
    audience:
      'Ligas amateur y municipales, canchas de fútbol rápido y organizadores de torneos de fútbol 5, 7 u 11.',
    highlights: ['Calendario automático', 'Cobros por jornada y caja del día', 'Marcador en vivo y página pública'],
    video: `${VIDEO_BASE}/ligafutbol.mp4`,
    poster: `${VIDEO_BASE}/ligafutbol-poster.jpg`,
    reference: { label: 'futbol.danysolutions.online', url: 'https://futbol.danysolutions.online/' },
    groups: [
      {
        title: 'Torneos',
        features: [
          { title: 'Calendario automático', text: 'Todos contra todos, copas o grupos más liguilla, con canchas y horarios sin empalmes.' },
          { title: 'Varios torneos a la vez', text: 'Fútbol 5, 7 u 11, cada torneo con su propio link público.' },
          { title: 'Equipos y plantillas', text: 'Logos, colores, jugadores y estado de pago de cada equipo en un solo lugar.' },
        ],
      },
      {
        title: 'Cobros',
        features: [
          { title: 'Cobros por jornada y caja del día', text: 'Inscripciones, arbitrajes y multas, con pago a árbitros y corte de caja.' },
          { title: 'Pagos con tarjeta', text: 'Inscripciones y cuotas con Mercado Pago, sin perseguir transferencias.' },
          { title: 'Balance de la liga', text: 'Ingresos, gastos y balance en tiempo real, con exportación a CSV y PDF.' },
        ],
      },
      {
        title: 'En la cancha',
        features: [
          { title: 'Marcador en vivo', text: 'El árbitro registra goles y tarjetas al minuto, pasa lista y firma el acta digital.' },
          { title: 'Acceso por rol', text: 'Administrador, árbitro y capitán, cada uno con su panel; el capitán ve la cooperación de sus jugadores.' },
        ],
      },
      {
        title: 'Para la afición',
        features: [
          { title: 'Página pública del torneo', text: 'Tabla automática, goleadores, estadísticas y bracket de liguilla para equipos y aficionados.' },
        ],
      },
    ],
  },
  {
    slug: 'podologia',
    name: 'Podología',
    tagline: 'Agenda, WhatsApp y expediente clínico para tu consultorio de podología.',
    audience:
      'Consultorios y clínicas de podología que trabajan con cita y quieren dejar la libreta y los mensajes a mano.',
    highlights: ['Citas en línea y por WhatsApp', 'Recordatorios automáticos', 'Expediente clínico con PDF'],
    video: `${VIDEO_BASE}/podologia.mp4`,
    poster: `${VIDEO_BASE}/podologia-poster.jpg`,
    reference: { label: 'PodoclinicAM, Cd. Sahagún', url: 'https://podologia.danysolutions.online/' },
    groups: [
      {
        title: 'Agenda',
        features: [
          { title: 'Citas en línea en 3 pasos', text: 'El paciente elige fecha, hora y deja sus datos; tú confirmas la cita.' },
          { title: 'Agenda con Google Calendar', text: 'Vista por día, semana o mes sincronizada con Google Calendar, con horarios, duración de cita y días de cierre.' },
          { title: 'Citas por confirmar', text: 'Una bandeja para confirmar o cancelar solicitudes, con aviso y sonido cuando llega una nueva.' },
        ],
      },
      {
        title: 'WhatsApp',
        features: [
          { title: 'Bot de recepción', text: 'Tus pacientes agendan, consultan horarios o cambian su cita por WhatsApp, con tu saludo e imagen.' },
          { title: 'Confirmaciones y recordatorios', text: 'Mensajes automáticos al confirmar y recordatorios el día de la cita o minutos antes.' },
        ],
      },
      {
        title: 'Expediente clínico',
        features: [
          { title: 'Historia clínica digital', text: 'Captura guiada en 8 pasos, de los antecedentes al diagnóstico y tratamiento.' },
          { title: 'Consentimiento en PDF', text: 'El consentimiento informado se genera listo para imprimir, con tu nombre y cédula.' },
          { title: 'Seguimiento con fotos', text: 'En cada cita registra notas de evolución, plan de tratamiento y fotos de evidencia.' },
        ],
      },
      {
        title: 'Tu consultorio',
        features: [
          { title: 'App para tu equipo', text: 'Aplicación Android con calendario, citas pendientes y aviso de cada cita nueva.' },
          { title: 'Sitio web con tu marca', text: 'Servicios con precios, reseñas moderadas y contacto con mapa y horarios, editables desde el panel.' },
        ],
      },
    ],
  },
  {
    slug: 'ventacheck',
    name: 'VentaCheck',
    tagline: 'Tienda en línea, punto de venta e inventario por sucursal en un solo sistema.',
    audience:
      'Tiendas, boutiques, ferreterías y comercios que venden en mostrador y en línea, con una o varias sucursales.',
    highlights: ['Tienda en línea con CFDI', 'Caja con código de barras', 'Inventario por sucursal'],
    video: null,
    poster: null,
    reference: { label: 'Outlet Premium Sahagún', url: 'https://outletpremiumsahagun.danysolutions.online/' },
    groups: [
      {
        title: 'Tienda en línea',
        features: [
          { title: 'Catálogo y buscador', text: 'Categorías, filtros, buscador con sugerencias y fichas con variantes, galería y video.' },
          { title: 'Compra sin crear cuenta', text: 'Envío a domicilio o recoger en sucursal, con pago con tarjeta por Mercado Pago.' },
          { title: 'Factura CFDI', text: 'Tu cliente pide su factura al comprar y se timbra de forma automática.' },
          { title: 'Envíos con paquetería', text: 'Cotiza, genera guías y rastrea envíos con T1 Envíos.' },
        ],
      },
      {
        title: 'Punto de venta',
        features: [
          { title: 'Caja con lector de código de barras', text: 'Cobra en efectivo, tarjeta o transferencia y, si no hay existencia, búscalo en otra sucursal.' },
          { title: 'Corte de caja', text: 'Abre con fondo inicial, registra entradas y salidas y cierra con faltantes y sobrantes.' },
          { title: 'Ticket térmico', text: 'Imprime por Bluetooth, USB o Windows en papel de 58 u 80 mm, con tu logo.' },
        ],
      },
      {
        title: 'Inventario y control',
        features: [
          { title: 'Inventario por sucursal', text: 'Existencias y disponible por sucursal, con traspasos con folio e historial.' },
          { title: 'Roles de usuario', text: 'Administrador, almacén y ventas, cada uno con su sucursal y sus permisos.' },
          { title: 'Dashboard y reportes', text: 'Ventas web contra mostrador, ticket promedio, productos más vendidos e ingresos por sucursal.' },
        ],
      },
    ],
    notes: 'Pagos con tarjeta, CFDI y paquetería usan tus propias cuentas de Mercado Pago, Facturapi y T1 Envíos.',
  },
];

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const whatsappProductHref = (phone, product) => {
  const digits = (phone || '+528112141456').replace(/\D/g, '');
  const text = `Hola Daniel, me interesa ${product.name}. ¿Me das más información?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};
