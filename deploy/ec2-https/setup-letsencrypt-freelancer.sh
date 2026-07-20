#!/usr/bin/env bash
# Instala nginx + certbot (si faltan) y emite certificado Let's Encrypt para
# www.danysolutions.online SIN tocar otros sitios ni contenedores (p. ej. NetosPio).
#
# Uso en el servidor:
#   sudo bash deploy/ec2-https/setup-letsencrypt-freelancer.sh [DOMINIO] [EMAIL]

set -euo pipefail

DOMAIN="${1:-www.danysolutions.online}"
EMAIL="${2:-danielortegalozano@gmail.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBROOT="/var/www/certbot"
CONF_DEST="/etc/nginx/conf.d/freelancer-https.conf"
CONF_BOOTSTRAP="${SCRIPT_DIR}/nginx-host-freelancer-bootstrap.conf"

export DEBIAN_FRONTEND=noninteractive

# 1) Instalar nginx y certbot si no existen (no modifica software existente)
if ! command -v nginx >/dev/null 2>&1; then
  echo ">> Instalando nginx ..."
  apt-get update -y
  apt-get install -y nginx
fi
if ! command -v certbot >/dev/null 2>&1; then
  echo ">> Instalando certbot ..."
  apt-get install -y certbot
fi

systemctl enable nginx >/dev/null 2>&1 || true
systemctl start nginx >/dev/null 2>&1 || true

mkdir -p "$WEBROOT" /etc/nginx/conf.d

# 2) Fase bootstrap HTTP para reto ACME (si aun no hay certificado)
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  cp "$CONF_BOOTSTRAP" "$CONF_DEST"
  nginx -t
  systemctl reload nginx

  certbot certonly --webroot \
    -w "$WEBROOT" \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --no-eff-email
fi

# 3) Fase final HTTPS con rutas Let's Encrypt
cp "${SCRIPT_DIR}/nginx-host-freelancer.conf" "$CONF_DEST"
nginx -t
systemctl reload nginx

echo "OK: certificado Let's Encrypt activo para ${DOMAIN}"
echo "Comprueba: curl -sI https://${DOMAIN}/ | head -5"
