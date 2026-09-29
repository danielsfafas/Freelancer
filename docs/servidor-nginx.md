# Configuración del Servidor Nginx

Esta guía describe la configuración completa de nginx para producción del sitio danysolutions.online.

## Requisitos

- Servidor con Ubuntu/Debian
- Nginx instalado
- Certificado SSL (Let's Encrypt recomendado)
- DNS configurado para www.danysolutions.online y danysolutions.online

## Configuración DNS

Antes de configurar nginx, asegúrate de que los registros DNS estén configurados:

```
# En tu proveedor de DNS:
A    danysolutions.online        -> [IP_DEL_SERVIDOR]
A    www.danysolutions.online    -> [IP_DEL_SERVIDOR]
# o
CNAME www.danysolutions.online   -> danysolutions.online
```

## Archivo de Configuración Nginx

Crear archivo `/etc/nginx/sites-available/danysolutions.online`:

```nginx
# Redirigir dominio sin www a www
server {
    listen 80;
    listen [::]:80;
    server_name danysolutions.online;
    return 301 https://www.danysolutions.online$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name danysolutions.online;

    # Certificados SSL (ajustar rutas según tu instalación)
    ssl_certificate /etc/letsencrypt/live/danysolutions.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/danysolutions.online/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    return 301 https://www.danysolutions.online$request_uri;
}

# Configuración principal del sitio
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.danysolutions.online;

    root /var/www/danysolutions/build;
    index index.html;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/danysolutions.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/danysolutions.online/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Otras cabeceras de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Compresión Brotli (si está instalado el módulo)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css text/xml text/javascript 
    #              application/json application/javascript application/xml+rss 
    #              application/rss+xml font/truetype font/opentype 
    #              application/vnd.ms-fontobject image/svg+xml;

    # Cache para archivos estáticos con hash en el nombre
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Si el archivo tiene hash en el nombre, puede ser cacheado indefinidamente
        if ($request_filename ~* ".*\.[0-9a-f]{8,}\.(js|css)$") {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }

    # Proxy para el backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy para archivos subidos
    location /uploads/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Cache para uploads
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # No cachear index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Página 404 personalizada (sirve index.html para que React maneje el 404)
    error_page 404 /index.html;

    # Logs
    access_log /var/log/nginx/danysolutions_access.log;
    error_log /var/log/nginx/danysolutions_error.log;
}
```

## Pasos de Instalación

### 1. Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Crear la configuración

```bash
sudo nano /etc/nginx/sites-available/danysolutions.online
# Pegar la configuración de arriba
```

### 3. Habilitar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/danysolutions.online /etc/nginx/sites-enabled/
```

### 4. Instalar Certbot para SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d danysolutions.online -d www.danysolutions.online
```

### 5. Verificar y recargar nginx

```bash
# Verificar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

### 6. Configurar renovación automática de SSL

```bash
# Probar renovación
sudo certbot renew --dry-run

# Certbot crea automáticamente un cron job para renovación
```

## Opcional: Instalar Brotli

Para mejor compresión que gzip:

```bash
sudo apt install nginx-module-brotli

# Agregar al inicio de nginx.conf:
# load_module modules/ngx_http_brotli_filter_module.so;
# load_module modules/ngx_http_brotli_static_module.so;

# Luego descomentar las líneas brotli en la configuración del sitio
```

## Verificación

Después de configurar, verifica:

1. **Redirect funcionando**: `curl -I http://danysolutions.online` debe devolver 301 a https://www.
2. **HTTPS funcionando**: `curl -I https://www.danysolutions.online` debe devolver 200
3. **HSTS activo**: Verificar headers con las herramientas de desarrollo del navegador
4. **Compresión activa**: `curl -H "Accept-Encoding: gzip" -I https://www.danysolutions.online/static/js/main.js`

## Troubleshooting

### El dominio sin www no resuelve

- Verificar registros DNS A para danysolutions.online
- Puede tardar hasta 48 horas en propagarse (normalmente minutos)
- Usar `dig danysolutions.online` para verificar

### Error 502 Bad Gateway en /api/

- Verificar que el backend esté corriendo: `docker ps` o `systemctl status backend`
- Verificar puerto correcto (8000 en este ejemplo)
- Revisar logs: `sudo tail -f /var/log/nginx/danysolutions_error.log`

### Error de certificado SSL

- Verificar que certbot completó correctamente
- Asegurar que las rutas de certificado en nginx.conf son correctas
- Renovar manualmente: `sudo certbot renew --force-renewal`

## Mantenimiento

```bash
# Ver logs en tiempo real
sudo tail -f /var/log/nginx/danysolutions_access.log
sudo tail -f /var/log/nginx/danysolutions_error.log

# Recargar configuración sin downtime
sudo nginx -t && sudo systemctl reload nginx

# Reiniciar nginx (causa breve downtime)
sudo systemctl restart nginx
```

## Notas Adicionales

- Esta configuración asume que la aplicación React está construida en `/var/www/danysolutions/build`
- El backend debe estar corriendo en el puerto 8000 (ajustar según tu configuración)
- Los certificados SSL se renuevan automáticamente cada 90 días
- HSTS está configurado con 1 año, considera el impacto antes de hacer preload
