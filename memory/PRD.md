# PRD - Daniel Ortega Portfolio Website

## Problema Original
Crear una página web profesional para un freelancer de tecnología (Daniel Ortega) con:
- Especialización en Angular, React, C#, Java y Arduino
- Sistema de agendamiento de citas
- Portafolio dinámico con filtros
- Panel de administración completo

## User Personas
1. **Visitante/Cliente Potencial**: Busca servicios de desarrollo de software
2. **Daniel Ortega (Admin)**: Gestiona proyectos, citas y contenido del sitio

## Requerimientos Core (Estáticos)
- [x] Página principal con hero, servicios, portafolio, testimonios, contacto
- [x] Sistema de agendamiento con calendario interactivo
- [x] Panel de administración con autenticación JWT
- [x] CRUD de proyectos del portafolio
- [x] Gestión de citas agendadas
- [x] Formulario de contacto funcional
- [x] Diseño responsive y moderno (tema oscuro)

## Stack Tecnológico
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI (Python)
- Base de Datos: MongoDB
- Autenticación: JWT

## Lo Implementado (07-04-2026)

### Página Principal
- Hero section con fondo dinámico y stack tecnológico
- Sección de servicios (5 servicios editables)
- Portafolio con filtros por categoría (Web, IoT, C#/Java)
- Testimonios de clientes
- Formulario de contacto funcional
- Footer con información de contacto

### Sistema de Agendamiento
- Calendario interactivo para seleccionar fecha
- Formulario con campos: nombre, email, teléfono, hora, tipo de servicio, descripción
- Validación de campos
- Confirmación de cita exitosa

### Panel de Administración
- Login seguro con JWT
- Dashboard con estadísticas (proyectos, citas, mensajes)
- CRUD completo de proyectos (crear, editar, eliminar)
- Gestión de citas (ver detalles, cambiar estado, notas internas)
- Visualización de mensajes de contacto
- Configuración de perfil y servicios

### Backend API
- Autenticación: login, logout, me
- Proyectos: CRUD completo con filtros
- Citas: CRUD con estados (pending, confirmed, completed, cancelled)
- Contactos: creación y listado
- Testimonios: CRUD
- Servicios: lectura y actualización
- Perfil: lectura y actualización
- Stats: estadísticas del dashboard

## Backlog Priorizado

### P0 (Crítico)
- Todo implementado ✓

### P1 (Importante)
- [ ] Envío de emails de confirmación de cita
- [ ] Notificaciones push para nuevas citas
- [ ] Upload de imágenes para proyectos (actualmente solo URL)

### P2 (Mejoras)
- [ ] Blog opcional para artículos técnicos
- [ ] Integración con Google Calendar
- [ ] Dashboard con métricas avanzadas
- [ ] Multi-idioma (ES/EN)

## Credenciales de Prueba
- **Admin Email**: admin@danielortega.com
- **Admin Password**: Admin123!

## Próximos Pasos
1. Considerar integración de envío de emails para confirmaciones
2. Mejorar sistema de notificaciones
3. Agregar funcionalidad de blog si se requiere
