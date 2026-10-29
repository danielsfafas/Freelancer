# CHANGELOG: Módulo Portón (12 oct 2026)

## Nuevo
- **backend/gate/**: módulo Portón dentro del FastAPI y MongoDB existentes, con rutas en `/api/gate/*`.
  - `WS /api/gate/device/ws`: conexión saliente del ESP32. Se autentica con un saludo firmado con HMAC-SHA256 (`GATE_DEVICE_SECRET`).
  - `WS /api/gate/app/ws`: modo hold-to-run (se acciona mientras se mantiene presionado) para el panel (JWT con rol admin) y para la PWA familiar (llave personal). La app manda `press`, un heartbeat (`hb`) cada 300 ms y `release`.
  - Cada comando al ESP32 va firmado con HMAC-SHA256 e incluye nonce, timestamp (±10 s) y un contador monotónico. El ESP32 responde `press` y `release` con un ack firmado.
  - Seguridad del relé:
    - dead-man de 800 ms tanto en el servidor como en el ESP32;
    - tope de 30 s (`GATE_MAX_HOLD_S`);
    - enfriamiento de 10 s entre presiones;
    - rate limit de 4 presiones por minuto por usuario y 12 en total;
    - una sola sesión a la vez.
  - Si el dispositivo está desconectado, la orden falla y **nunca se encola**.
  - `GET /api/gate/status`: accesible para un admin o con una llave válida.
  - `GET/POST /api/gate/users` y `POST /api/gate/users/{id}/revoke`: solo admin. Las llaves `prt_` son de 256 bits, se guarda únicamente su SHA-256, se muestran una sola vez y pueden tener vencimiento opcional.
  - `GET /api/gate/log`: solo admin.
  - Colecciones nuevas en Mongo: `gate_users` y `gate_log`. La bitácora guarda inicio, fin, duración, motivo de fin, IP, quién y los acks.
  - Si `GATE_DEVICE_SECRET` no está definido, el portón queda deshabilitado y el resto del sitio funciona igual.
- **Admin React**: nueva sección **Portón** (`/admin/porton`), visible solo para el rol admin. Muestra el estado del dispositivo y tiene el botón de mantener presionado, la gestión de personas con acceso (crear con vencimiento opcional y revocar) y la bitácora.
- **PWA familiar `/porton`**: pide la llave personal una vez y la guarda en IndexedDB. Usa el mismo botón y el mismo estado. Tiene manifest y service worker propios (`porton-sw.js`), que nunca interceptan `/api`.
- **esp32-porton/**: firmware con WSS y CA pineada, verificación de firma, NTP y contador en NVS, dead-man, tope, watchdog, relé en NO apagado al arrancar, `secrets.h.example` y guía de cableado.
- **backend/tests/**: 23 pruebas pytest con mongomock y un ESP32 simulado. Se agregó `backend/requirements-test.txt`.

## Endurecimiento mínimo del panel
- **Rol admin en el servidor** para todas las rutas de administración del portón y para accionarlo desde el panel. Un usuario del panel sin `role: "admin"` recibe un 403.
- **Rate limit en el login**: 10 fallos cada 15 min por IP y 20 por email; después responde 429. Se configura con `LOGIN_*`. La IP real se toma de `X-Forwarded-For` según `TRUSTED_PROXY_HOPS=2` (nginx del host más nginx del contenedor).
- **Admin semilla**:
  - Ya no hay contraseña por defecto (`Admin123!`).
  - Ya **no se reescribe** la contraseña en cada arranque.
  - Si el admin no existe, solo se crea cuando `ADMIN_PASSWORD` está definido.
  - Para recuperar o cambiar la contraseña: definir `ADMIN_PASSWORD_RESET=1` junto con `ADMIN_PASSWORD`, reiniciar una vez y luego quitar `ADMIN_PASSWORD_RESET`.
  - Se eliminó la escritura de la contraseña en claro en `/app/memory/test_credentials.md`.
  - `docker-compose.prod.yml` y `docker-compose.ec2.yml` ya no tienen el valor por defecto `Admin123!`. `docker-compose.yml` (desarrollo local) no se tocó.
  - **No deja al usuario sin acceso**: el hash actual del admin en Mongo no se modifica, así que la contraseña que funciona hoy sigue funcionando.

## Infraestructura
- `backend/Dockerfile`: ahora copia `gate/`. `backend/requirements.txt`: se agrega `websockets` (uvicorn lo necesita para WebSocket).
- `frontend/nginx.conf`: nueva ruta `location /api/gate/` con Upgrade y timeout de 120 s.
- `deploy/ec2-https/nginx-host-freelancer.conf`: nueva ruta `location /api/gate/` (Upgrade, `X-Forwarded-For` no falsificable, timeouts).
- `docker-compose.ec2.yml`: se pasa `GATE_DEVICE_SECRET`.

## Pendiente (no aplicado a propósito)
- Seguir guardando el JWT en `localStorage` y las cookies con `secure=False`: cambiarlo exige rehacer el flujo de autenticación del panel.
- No hay MFA.
- No hay CSP en todo el sitio, porque `index.html` tiene scripts inline.
- `JWT_SECRET` con valor por defecto en `docker-compose.ec2.yml`.
- Las rutas de administración antiguas (proyectos, citas y demás) solo piden estar autenticado, no el rol admin. Hoy solo existe el usuario admin, así que no cambia nada, pero conviene usar `require_admin` en ellas en una siguiente iteración.
