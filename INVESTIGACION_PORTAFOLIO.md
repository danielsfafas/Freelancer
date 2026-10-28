# Investigación del Portafolio - DanySolutions

## Cambios Realizados (Aprobados)

### ✅ Rehabilitá - Enlace Actualizado
- **Archivo modificado**: `backend/server.py` (línea 517)
- **Cambio**: URL de `https://rehabilita.danysolutions.online/` → `https://democitas.danysolutions.online/`
- **Nota añadida**: "La versión de fisioterapia ahora está disponible en el demo de CitasCheck"
- **Script actualizado**: `scripts/fetch_site_logos.py` (línea 16)
- **Build**: ✅ Verificado exitosamente

## Investigación Pendiente de Aprobación

### 1. Podología - Textos Anunciados

**Ubicación del texto**: `/workspace/frontend/src/data/products.js`

```javascript
// Línea 142 - highlights del producto
highlights: ['Citas en línea y por WhatsApp', 'Recordatorios automáticos', 'Expediente clínico con PDF'],

// Líneas 151-158 - Funcionalidades detalladas
{
  title: 'Agenda',
  features: [
    { title: 'Agenda con Google Calendar', text: 'Vista por día, semana o mes sincronizada con Google Calendar...' },
    // ...
  ]
},
{
  title: 'WhatsApp',
  features: [
    { title: 'Bot de recepción', text: 'Tus pacientes agendan, consultan horarios o cambian su cita por WhatsApp...' },
    { title: 'Confirmaciones y recordatorios', text: 'Mensajes automáticos al confirmar y recordatorios...' },
  ]
}
```

**Tamaño del cambio**: Pequeño - solo texto en un archivo de datos.

---

### 2. Estructura de Proyectos/Productos

**Archivo principal de datos**: `/workspace/frontend/src/data/products.js`

La lista de productos está definida en la constante `PRODUCTS` (líneas 8-219):

```javascript
export const PRODUCTS = [
  { slug: 'comandix', name: 'Comandix', ... },
  { slug: 'miembroscheck', name: 'MiembrosCheck', ... },
  { slug: 'ligafutbol', name: 'LigaFutbol', ... },
  { slug: 'podologia', name: 'Podología', ... },
  { slug: 'ventacheck', name: 'VentaCheck', ... },
];
```

**Archivo de portafolio**: `/workspace/backend/server.py` (líneas 498-564)

```python
portfolio_seed = [
    { "id": "proj-podologia", "title": "PodoclinicAM", ... },
    { "id": "proj-rehabilita", "title": "Rehabilitá", ... },
    { "id": "proj-moralesbox", "title": "Morales Box", ... },
    { "id": "proj-lozmar", "title": "Lozmar", ... },
    { "id": "proj-pancitapio", "title": "Pancita Los Netos", ... },
    { "id": "proj-ambar", "title": "Carnitas Ambar", ... },
]
```

**Componente de visualización**: `/workspace/frontend/src/components/ProductsSection.js`

**Mapeo portafolio → producto**: `/workspace/frontend/src/components/PortfolioSection.js` (líneas 13-20)

```javascript
const PROJECT_PRODUCT = {
  'proj-ambar': 'comandix',
  'proj-moralesbox': 'miembroscheck',
  'proj-podologia': 'podologia',
  '0de5e656-0154-43f2-8ebd-f5b2b987d5cb': 'ventacheck',
};
```

#### Productos que NO aparecen actualmente:
- **PizzasCheck**: Mencionado como `https://pizzas.danysolutions.online` (no existe en PRODUCTS)
- **LigaFutbol**: Existe en productos pero no tiene caso de portafolio asociado
- **Comandix**: Existe en productos, tiene caso (Ambar, Pancita)
- **MiembrosCheck**: Existe en productos, tiene caso (Morales Box)
- **VentaCheck**: Existe en productos, tiene caso (Outlet Premium Sahagún)

#### Nombres oficiales a actualizar:
1. **CitasCheck**: Nombre comercial del sistema de citas (actualmente "Podología")
2. **PizzasCheck**: `https://pizzas.danysolutions.online` - NO existe en el sitio actual
3. **LigaFutbol**: Ya usa nombre oficial ✅
4. **MiembrosCheck**: Ya usa nombre oficial ✅
5. **VentaCheck**: Ya usa nombre oficial ✅
6. **Comandix**: Ya usa nombre oficial ✅

**Tamaño del cambio para renombrar**: Mediano
- Modificar `frontend/src/data/products.js` (cambiar `name` del slug 'podologia' a 'CitasCheck')
- Agregar nuevo producto PizzasCheck si existe el sitio
- Actualizar referencias en SEO y metadatos
- Actualizar sitemap.xml

---

### 3. Botones en Cada Ficha

**Ubicación**: `/workspace/frontend/src/components/ProductsSection.js` (líneas 73-88)

Cada ficha de producto tiene DOS botones:
1. **"Ver funcionalidades"** (rojo, bg-[#FF2A00]) → Link a `/productos/{slug}`
2. **"Ver precios"** (texto gris) → Link a `/#pricing`

**Código actual**:
```javascript
<Link to={to} className="...bg-[#FF2A00]...">
  Ver funcionalidades
  <ArrowRight className="w-4 h-4" />
</Link>
<a href="/#pricing" className="...text-[#A3A3A3]...">
  Ver precios
</a>
```

**Tamaño del cambio**: Pequeño si solo se modifica texto, Mediano si se cambian destinos o se añaden botones.

---

### 4. Texto del Encabezado/Hero

**Ubicación**: `/workspace/frontend/src/components/HeroSection.js` (líneas 67-75)

```javascript
<h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-6">
  <span className="block text-balance">Sistemas y páginas web que te{'\u00A0'}traen</span>
  <span className="block text-balance text-[#FF2A00]">citas, pedidos y ventas</span>
</h1>

<p className="text-lg md:text-xl text-[#A3A3A3] max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
  Agenda en línea, pedidos por WhatsApp, punto de venta y tiendas en línea 
  para negocios de Hidalgo. <span className="text-white font-medium">+15 años de experiencia.</span>
</p>
```

**Tamaño del cambio**: Pequeño - solo texto en un componente.

---

### 5. Title/Meta Description de Rutas y Schema JSON-LD

#### Página Principal (`/`)
**Archivo**: `/workspace/frontend/public/index.html`

- **Title** (línea 7): `"DanySolutions | Desarrollo web, sistemas e IoT en Tepeapulco, Hidalgo — Daniel Ortega"`
- **Meta Description** (líneas 8-11): `"Desarrollador web en Tepeapulco Hidalgo (área Hidalgo): React, Angular, IoT con Arduino, C# y Java. Consultoría full stack — DanySolutions (Daniel Ortega)."`
- **Schema JSON-LD** (líneas 50-109): Tipo `@graph` con 3 entidades:
  1. `WebSite` - El sitio
  2. `Person` - Daniel Ortega (perfil profesional)
  3. `ProfessionalService` - El servicio de DanySolutions

#### Rutas de Productos (`/productos/:slug`)
**Archivo**: `/workspace/frontend/src/pages/ProductPage.js` (líneas 35-44)

```javascript
useEffect(() => {
  if (!product) return undefined;
  const timer = setTimeout(() => {
    document.title = `${product.name}: funcionalidades | DanySolutions`;
  }, 0);
  const previousDescription = setMetaDescription(`${product.name}: ${product.tagline}`);
  // ...
}, [product]);
```

**Títulos dinámicos generados**:
- Comandix: `"Comandix: funcionalidades | DanySolutions"`
- MiembrosCheck: `"MiembrosCheck: funcionalidades | DanySolutions"`
- etc.

**Meta descriptions dinámicas**: Se usa el `tagline` de cada producto.

**Schema**: NO hay schema específico en páginas de productos (solo en la página principal).

#### Sitemap
**Archivo**: `/workspace/frontend/public/sitemap.xml`

Contiene:
- `/` (prioridad 1.0)
- `/schedule` (prioridad 0.8)
- `/productos/comandix` (prioridad 0.8)
- `/productos/miembroscheck` (prioridad 0.8)
- `/productos/ligafutbol` (prioridad 0.8)
- `/productos/podologia` (prioridad 0.8)
- `/productos/ventacheck` (prioridad 0.8)
- `/privacidad` (prioridad 0.3)
- `/terminos` (prioridad 0.3)

**Tamaño del cambio para actualizar SEO**: Mediano
- Actualizar títulos en ProductPage.js si cambian nombres de productos
- Actualizar sitemap.xml si se añade PizzasCheck
- Schema JSON-LD en index.html no requiere cambios (es genérico)

---

### 6. Enlaces de GitHub, LinkedIn y Tarjetas de Portafolio

#### GitHub
**Ubicación**: `/workspace/frontend/src/components/Footer.js` (línea 31)
```javascript
<a href="https://github.com/danielortega" ...>
```

#### LinkedIn
**Ubicación**: `/workspace/frontend/src/components/Footer.js` (línea 41)
```javascript
<a href="https://linkedin.com/in/danielortega" ...>
```

#### Pancita Los Netos
**Ubicación**: `/workspace/backend/server.py` (línea 550)
```python
"demo_url": "https://pancitapio.danysolutions.online/",
```
**Nombre confirmado por el usuario**: "Pancita Los Netos" (ya actualizado en el código).

#### Morales Box
**Ubicación**: 
- Backend: `/workspace/backend/server.py` (línea 528)
  ```python
  "demo_url": "https://moralesbox.danysolutions.online/",
  ```
- Frontend (referencia en producto): `/workspace/frontend/src/data/products.js` (línea 60)
  ```javascript
  reference: { label: 'Morales Box, Tepeapulco', url: 'https://moralesbox.danysolutions.online/' },
  ```

**Tamaño del cambio**: Ninguno - los enlaces están correctos.

---

### 7. Correo de Contacto

**Correo utilizado**: `danielortegalozano@gmail.com`

**Ubicaciones**:
1. **Footer** - `/workspace/frontend/src/components/Footer.js` (línea 101)
   ```javascript
   <a href="mailto:danielortegalozano@gmail.com" ...>
   ```

2. **Perfil en backend** - `/workspace/backend/server.py` (línea 382)
   ```python
   "email": "danielortegalozano@gmail.com",
   ```

3. **Schema JSON-LD** - `/workspace/frontend/public/index.html` (línea 69)
   ```html
   "email": "danielortegalozano@gmail.com",
   ```

**Tamaño del cambio**: Pequeño si se requiere cambiar - buscar y reemplazar en 3 archivos.

---

## Resumen de Complejidad de Cambios Futuros

| Tarea | Archivos Afectados | Complejidad |
|-------|-------------------|-------------|
| Renombrar "Podología" a "CitasCheck" | `products.js`, `sitemap.xml` | Pequeña |
| Añadir PizzasCheck | `products.js`, `sitemap.xml`, backend (si aplica) | Mediana |
| Actualizar textos del Hero | `HeroSection.js` | Pequeña |
| Cambiar botones de fichas | `ProductsSection.js` | Pequeña-Mediana |
| Actualizar SEO productos | `ProductPage.js`, `sitemap.xml` | Mediana |
| Cambiar correo de contacto | 3 archivos (Footer, backend, index.html) | Pequeña |

## Verificación del Build

✅ **Build completado exitosamente** con solo 2 warnings de eslint (no relacionados con los cambios):
- `src/pages/AdminAppointments.js` línea 52 - useEffect dependency
- `src/pages/AdminMessages.js` línea 31 - useEffect dependency

**Archivos generados**:
- `build/static/js/main.371945dd.js` (179.33 kB gzipped)
- `build/static/css/main.e29e08a0.css` (12.25 kB gzipped)
