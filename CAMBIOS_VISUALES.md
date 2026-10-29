# Documentación de Cambios Visuales

## Nota sobre Capturas
El servidor de desarrollo no está disponible en el entorno actual, por lo que se documenta detalladamente cada cambio visual realizado.

## 1. Hero Section (Encabezado Principal)

### ANTES:
```
Label: "Desarrollador web · Tepeapulco Hidalgo"
Título: "Sistemas y páginas web que te traen citas, pedidos y ventas"
Subtítulo: "Agenda en línea, pedidos por WhatsApp, punto de venta y tiendas en línea 
para negocios de Hidalgo. +15 años de experiencia."
```

### DESPUÉS:
```
Label: "Sistemas para negocios · Tepeapulco Hidalgo"
Título: "DanySolutions: sistemas listos por giro, hechos en Hidalgo"
Subtítulo: "Portafolio de proyectos reales para consultorios, gimnasios, pizzerías, 
tiendas y ligas deportivas. Software desarrollado y probado en Hidalgo."
```

**Cambio**: De enfoque CV/personal a enfoque de marca empresarial/portafolio.

---

## 2. Productos - Lista Actualizada

### ANTES (5 productos):
1. Comandix ✓
2. MiembrosCheck ✓
3. LigaFutbol ✓
4. **Podología** ❌
5. VentaCheck ✓

### DESPUÉS (6 productos):
1. Comandix ✓
2. MiembrosCheck ✓
3. LigaFutbol ✓
4. **CitasCheck** ✅ (nuevo nombre)
5. VentaCheck ✓
6. **PizzasCheck** ✅ (nuevo producto)

---

## 3. CitasCheck (antes Podología) - Cambios Detallados

### Cambios en la Tarjeta Principal:
- **Nombre**: "Podología" → "CitasCheck"
- **Tagline**: "Agenda, WhatsApp y expediente clínico para tu consultorio de podología" 
  → "Agenda, WhatsApp y expediente clínico para consultorios y clínicas"
- **Audiencia**: Ampliado de solo podología a podología, fisioterapia, psicología, nutrición y clínicas
- **Enlace de referencia**: 
  - ANTES: "PodoclinicAM, Cd. Sahagún" → https://podologia.danysolutions.online/
  - DESPUÉS: "Demo CitasCheck" → https://democitas.danysolutions.online/

### Highlights Actualizados:
- 'Citas en línea y por WhatsApp' ✓ (sin cambios)
- **'Recordatorios automáticos'** → **'Recordatorios automáticos (en pruebas)'** ⚠️
- 'Expediente clínico con PDF' ✓ (sin cambios)

### Funcionalidades - Sección Agenda:
**ELIMINADO**:
- ❌ 'Agenda con Google Calendar' (removida completamente)

**MANTENIDAS**:
- ✓ 'Citas en línea en 3 pasos'
- ✓ 'Citas por confirmar'

### Funcionalidades - Sección WhatsApp:
- **'Bot de recepción'** → **'Bot de recepción (en pruebas)'** ⚠️
- **'Confirmaciones y recordatorios'** → **'Recordatorios automáticos (en pruebas)'** ⚠️

**Indicador visual**: El texto "(en pruebas)" aparece en el título de cada funcionalidad marcada.

---

## 4. PizzasCheck (Nuevo Producto)

### Tarjeta Principal:
- **Nombre**: PizzasCheck
- **Tagline**: "Sistema de pedidos y entregas para pizzerías: en línea, por WhatsApp y punto de venta"
- **Audiencia**: "Pizzerías que toman pedidos a domicilio y para llevar, con uno o varios repartidores"
- **Enlace**: https://pizzas.danysolutions.online/
- **Video**: No disponible (sin video/poster)

### Highlights:
- Pedidos en línea y WhatsApp
- Control de repartidores
- Caja y reportes

### Grupos de Funcionalidades:
1. **Pedidos**: 3 funcionalidades (en línea, WhatsApp, punto de venta)
2. **Entregas**: 2 funcionalidades (control, seguimiento)
3. **Gestión**: 2 funcionalidades (caja, reportes)

**Descripción**: Sobria, basada en funcionalidades reales, sin inventar cifras ni testimonios.

---

## 5. Footer - Cambios

### ANTES:
```
Descripción: "Daniel Ortega, desarrollador web e IoT en Tepeapulco..."
Íconos sociales:
  [GitHub] https://github.com/danielortega
  [LinkedIn] https://linkedin.com/in/danielortega
```

### DESPUÉS:
```
Descripción: "DanySolutions — Sistemas web y software para negocios en 
Tepeapulco, Hidalgo y toda la región. Soluciones funcionales probadas 
en operación real."
Íconos sociales: (ninguno)
```

**Cambio**: Removidos completamente los enlaces a GitHub y LinkedIn.

---

## 6. SEO y Metadata

### Títulos de Página (por producto):

| Producto | ANTES | DESPUÉS |
|----------|-------|---------|
| Comandix | `Comandix: funcionalidades \| DanySolutions` | `Comandix: punto de venta para restaurantes y taquerías \| DanySolutions` |
| MiembrosCheck | `MiembrosCheck: funcionalidades \| DanySolutions` | `MiembrosCheck: control de gimnasios y academias \| DanySolutions` |
| LigaFutbol | `LigaFutbol: funcionalidades \| DanySolutions` | `LigaFutbol: administra tu liga de fútbol completa \| DanySolutions` |
| CitasCheck | `Podología: funcionalidades \| DanySolutions` | `CitasCheck: agenda y expediente para consultorios \| DanySolutions` |
| VentaCheck | `VentaCheck: funcionalidades \| DanySolutions` | `VentaCheck: tienda en línea y punto de venta \| DanySolutions` |
| PizzasCheck | _(nuevo)_ | `PizzasCheck: pedidos y entregas para pizzerías \| DanySolutions` |

### Meta Descriptions (mejoradas):
Cada producto ahora tiene una meta description específica que incluye:
- Funcionalidades principales
- Ubicación (Hidalgo)
- Público objetivo

### Schema JSON-LD:

**ANTES**: `@type: "Person"`
```json
{
  "@type": "Person",
  "name": "Daniel Ortega",
  "jobTitle": "Desarrollador Full Stack e IoT",
  "knowsAbout": ["React", "Angular", "C#", ...],
  ...
}
```

**DESPUÉS**: `@type: "LocalBusiness"`
```json
{
  "@type": "LocalBusiness",
  "name": "DanySolutions",
  "description": "Desarrollo de software y sistemas web para negocios...",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tepeapulco",
    "addressRegion": "Hidalgo",
    "addressCountry": "MX"
  },
  ...
}
```

**Cambio**: De perfil personal (Person) a negocio local (LocalBusiness).
**Dirección**: Solo ciudad, región y país (SIN calle ni teléfono).

---

## 7. Sitemap Actualizado

### ANTES:
```xml
/productos/comandix
/productos/miembroscheck
/productos/ligafutbol
/productos/podologia  ❌
/productos/ventacheck
```

### DESPUÉS:
```xml
/productos/comandix
/productos/miembroscheck
/productos/ligafutbol
/productos/citascheck  ✅
/productos/ventacheck
/productos/pizzascheck  ✅ (nuevo)
```

---

## 8. Investigación: Tarjetas de Portafolio

### Pancita Los Netos

**Problema identificado**: 
- Nombre en el backend: "Pancita Los Netos"
- Título real del sitio: `<title>Pancita Pio</title>`
- URL: https://pancitapio.danysolutions.online/

**Análisis**: 
El dominio es `pancitapio.danysolutions.online`, lo que sugiere que el nombre comercial podría ser "Pancita Pio" y no "Pancita Los Netos". Esta inconsistencia existe en el sitio externo y **no se puede corregir desde este repositorio**.

**Recomendación**: Consultar con el cliente cuál es el nombre comercial oficial.

---

### Morales Box

**Problema identificado**:
- Título del sitio: `<title></title>` (vacío)
- URL: https://moralesbox.danysolutions.online/

**Análisis**:
El sitio carga el título dinámicamente desde la API:
```javascript
fetch("/api/settings").then(function(e){
  if(e.gym_name) document.title = e.gym_name
  ...
})
```

El título se establece mediante JavaScript después de cargar, por lo que la captura inicial muestra título vacío. Esto **no es un error del repositorio del portafolio**, sino del sitio de Morales Box en sí.

**Recomendación**: El sitio de Morales Box debería tener un título por defecto en el HTML antes de la carga de JS.

---

## Resumen de Cambios Visuales

✅ **Completado**:
1. Renombrado Podología → CitasCheck
2. Añadido PizzasCheck como nuevo producto
3. Marcadas funcionalidades "en pruebas" en CitasCheck
4. Removida funcionalidad "Agenda con Google Calendar"
5. Hero actualizado a enfoque de marca
6. Footer actualizado (sin GitHub/LinkedIn)
7. SEO mejorado (títulos, descriptions, schema)
8. Sitemap actualizado

⚠️ **Documentado (sin cambios en código)**:
1. Inconsistencia "Pancita Los Netos" vs "Pancita Pio" (sitio externo)
2. Título vacío en Morales Box (sitio externo)

🔒 **Sin cambios (como se solicitó)**:
- Botones en fichas de productos (mantenidos como estaban)
- Correo de contacto Gmail (sin cambios)
