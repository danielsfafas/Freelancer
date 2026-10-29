# Cómo publicar el módulo Portón (www.danysolutions.online)

> No se tocó el servidor ni GitHub. Estos son los pasos que tú ejecutas.

## 1. Variables nuevas (en el `.env` del servidor, sin comillas)
| Variable | Obligatoria | Qué es |
|---|---|---|
| `GATE_DEVICE_SECRET` | sí, para activar el portón | 64 caracteres hex. Genéralo con `openssl rand -hex 32`. El **mismo** valor va en `esp32-porton/secrets.h`. |
| `GATE_COOLDOWN_S` | no (10) | segundos entre inicios de presión |
| `GATE_MAX_HOLD_S` | no (30) | tope por presión |
| `GATE_HB_TIMEOUT_S` | no (0.8) | dead-man del servidor |
| `GATE_USER_PER_MIN` / `GATE_GLOBAL_PER_MIN` | no (4 / 12) | rate limit |
| `TRUSTED_PROXY_HOPS` | no (2) | número de proxies nginx delante del backend |
| `LOGIN_MAX_PER_IP` / `LOGIN_MAX_PER_EMAIL` / `LOGIN_WINDOW_S` | no (10 / 20 / 900) | rate limit del login |
| `ADMIN_PASSWORD_RESET` | no | solo para recuperar o cambiar la contraseña del admin (ver el paso 5) |

`ADMIN_PASSWORD` ya **no** tiene valor por defecto. Solo se usa si el admin no existe o si `ADMIN_PASSWORD_RESET=1`.

## 2. nginx del host (WebSocket `/api/gate/device/ws` y `/api/gate/app/ws`)
En `/etc/nginx/sites-available/` (el archivo de www.danysolutions.online), **antes** de `location /`:
```nginx
location /api/gate/ {
    proxy_pass http://127.0.0.1:9090;          # mismo upstream que location /
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
}
```
Después ejecuta `sudo nginx -t && sudo systemctl reload nginx`. Ya viene incluido en `deploy/ec2-https/nginx-host-freelancer.conf`. El nginx del contenedor (`frontend/nginx.conf`) también se actualizó.

## 3. Desplegar
1. Haz commit y push desde tu PC cuando lo revises (yo no hice commit).
2. En el servidor: `git pull`, agrega `GATE_DEVICE_SECRET` al `.env` y ejecuta `docker compose -f docker-compose.prod.yml up -d --build`.
3. El backend debe correr con **un solo worker** (ya es así: `uvicorn server:app`), porque la conexión del ESP32 vive en memoria.
4. Verifica:
   - Entra a `https://www.danysolutions.online/admin/porton`. Debe aparecer "Dispositivo desconectado" hasta que conectes el ESP32.
   - Si aparece "GATE_DEVICE_SECRET no está configurado", revisa el `.env`.

## 4. Llaves para familiares
En el panel: **Portón → Personas con acceso → Crear llave**. Puedes poner un vencimiento opcional. La llave se muestra **una sola vez**: compártela por un canal privado. El familiar abre `https://www.danysolutions.online/porton` en su teléfono, la pega y elige "Agregar a pantalla de inicio". Para quitarle el acceso, usa **Revocar**.

**Decisión: llave por usuario en lugar del login del panel.** Las rutas antiguas del panel solo piden estar autenticado, así que darle una cuenta del panel a un familiar le abriría proyectos, citas y demás. La llave solo permite accionar el portón y ver su estado, se puede revocar o hacer que venza, y no hay contraseñas que recordar.

## 5. Contraseña del admin (importante)
- Tu contraseña actual sigue funcionando: el cambio no toca el hash en Mongo.
- Los scripts del repo indican que en producción podría seguir la contraseña pública por defecto. Cámbiala:
  1. En el `.env` pon `ADMIN_PASSWORD=<una contraseña nueva y larga>` y `ADMIN_PASSWORD_RESET=1`.
  2. Ejecuta `docker compose -f docker-compose.prod.yml up -d`.
  3. Entra al panel con la contraseña nueva.
  4. **Borra** `ADMIN_PASSWORD_RESET` y vuelve a ejecutar `up -d`.
- Borra el archivo viejo con la contraseña en claro, si existe: `docker exec freelancer-backend rm -f /app/memory/test_credentials.md`.
- Tu usuario en Mongo debe tener `role: "admin"` (el seed lo crea así). Si la sección Portón muestra "Solo los administradores", ejecuta en Mongo: `db.users.updateOne({email:"<tu email>"},{$set:{role:"admin"}})`.

## 6. Flashear el ESP32 apuntando a este dominio
1. Instala Arduino IDE 2, el core **esp32 de Espressif (3.x)** y las librerías **WebSockets** (Markus Sattler) y **ArduinoJson** v7.
2. En `esp32-porton/`, copia `secrets.h.example` como `secrets.h` y llena estos valores:
   - `WIFI_SSID` y `WIFI_PASS`;
   - `API_HOST "www.danysolutions.online"`, `API_PORT 443` y `API_PATH "/api/gate/device/ws"` (ya vienen así);
   - `DEVICE_SECRET_HEX`: el mismo valor que `GATE_DEVICE_SECRET`;
   - `RELAY_PIN` y `RELAY_ACTIVE_HIGH`, según tu módulo;
   - `CA_CERT`: pega **ISRG Root X1** (https://letsencrypt.org/certs/isrgrootx1.pem), la raíz del certificado Let's Encrypt del dominio.
3. Sube `porton.ino`. En `/admin/porton` debe aparecer "Dispositivo conectado".
4. Cablea según `esp32-porton/README-cableado.md`:
   - relé COM–NO **en paralelo** al botón del control;
   - **nunca puentees la fotocelda**;
   - el control original debe seguir funcionando.
5. Prueba con un multímetro:
   - abierto al encender;
   - cerrado mientras mantienes presionado;
   - se abre al soltar en menos de 1 s, al quitar el WiFi y al pasar 30 s.

## 7. Pruebas locales
```bash
cd backend && pip install -r requirements.txt -r requirements-test.txt && pytest -q tests
cd frontend && npm ci --legacy-peer-deps && npm run build
```
