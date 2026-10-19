#!/usr/bin/env bash
# Instala nginx + certbot (si faltan) y emite certificado Let's Encrypt para
# www.danysolutions.online SIN tocar otros sitios ni contenedores (p. ej. NetosPio).
#
# Uso en el servidor:
#   sudo bash deploy/ec2-https/setup-letsencrypt-freelancer.sh [DOMINIO] [EMAIL]

set -euo pipefail

DOMAIN="${1:-www.danysolutions.online}"
EMAIL="${2:-danielortegalozano@gmail.com}"
# Dominio raíz (apex): www.danysolutions.online -> danysolutions.online.
# Comparte el certificado de www y solo redirige a https://www.
APEX="${3:-${DOMAIN#www.}}"
BACKUP_DIR="/root/backups/nginx-freelancer"
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

mkdir -p "$WEBROOT" /etc/nginx/conf.d "$BACKUP_DIR"

# Respaldo de la configuración actual antes de cambiarla
STAMP="$(date +%Y%m%d-%H%M%S)"
if [[ -f "$CONF_DEST" ]]; then
  cp -a "$CONF_DEST" "${BACKUP_DIR}/freelancer-https.conf.${STAMP}"
  echo ">> Respaldo: ${BACKUP_DIR}/freelancer-https.conf.${STAMP}"
fi
if [[ -f "/etc/letsencrypt/renewal/${DOMAIN}.conf" ]]; then
  cp -a "/etc/letsencrypt/renewal/${DOMAIN}.conf" "${BACKUP_DIR}/renewal-${DOMAIN}.conf.${STAMP}"
fi

cert_has_apex() {
  local crt="/etc/letsencrypt/live/${DOMAIN}/cert.pem"
  [[ -f "$crt" ]] && openssl x509 -in "$crt" -noout -text | grep -q "DNS:${APEX}\(,\|$\)"
}

# 2) Fase bootstrap HTTP para reto ACME (si aun no hay certificado)
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  cp "$CONF_BOOTSTRAP" "$CONF_DEST"
  nginx -t
  systemctl reload nginx

  certbot certonly --webroot \
    -w "$WEBROOT" \
    --cert-name "$DOMAIN" \
    -d "$DOMAIN" \
    -d "$APEX" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --no-eff-email
fi

# 3) Fase final HTTPS con rutas Let's Encrypt (www + bloques apex)
cp "${SCRIPT_DIR}/nginx-host-freelancer.conf" "$CONF_DEST"
if ! nginx -t; then
  echo "!! nginx -t falló; restaurando respaldo" >&2
  [[ -f "${BACKUP_DIR}/freelancer-https.conf.${STAMP}" ]] && cp -a "${BACKUP_DIR}/freelancer-https.conf.${STAMP}" "$CONF_DEST"
  nginx -t && systemctl reload nginx
  exit 1
fi
systemctl reload nginx

# 4) Expandir el certificado para incluir el apex si aún no lo cubre.
#    El bloque :80 del apex ya sirve /.well-known/acme-challenge/ desde $WEBROOT.
if ! cert_has_apex; then
  echo ">> Expandiendo certificado ${DOMAIN} para incluir ${APEX} ..."
  certbot certonly --webroot \
    -w "$WEBROOT" \
    --cert-name "$DOMAIN" \
    --expand \
    -d "$DOMAIN" \
    -d "$APEX" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --no-eff-email
  nginx -t
  systemctl reload nginx
fi

echo "OK: certificado Let's Encrypt activo para ${DOMAIN} y ${APEX} (apex redirige a https://${DOMAIN})"
echo "Comprueba: curl -sI https://${DOMAIN}/ | head -5"
