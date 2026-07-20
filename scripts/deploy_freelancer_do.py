#!/usr/bin/env python3
"""Despliega Freelancer en el server DO 174.138.47.217 bajo /opt/freelancer.

- Domino: www.danysolutions.online con certificado Let's Encrypt.
- Carpeta dedicada: /opt/freelancer (proyecto compose 'freelancer').
- NO toca /opt/netospio, netospio-https.conf, ni puertos 9082/9083/8788/8081.
"""
from __future__ import annotations

import os
import secrets
import sys
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko

ROOT = Path(r"C:\Shared\Freelancer\Freelancer")
REMOTE_DIR = "/opt/freelancer"
HOST = "174.138.47.217"
DOMAIN = "www.danysolutions.online"
PANCITA_DOMAIN = "pancitapio.danysolutions.online"
EMAIL = "danielortegalozano@gmail.com"
SECRET_FILE = Path(r"C:\Shared\.deploy_tmp\secret.txt")


def load_ssh_pass() -> str:
    for var in ("passdigitalocean", "PASSDIGITALOCEAN"):
        env = os.environ.get(var)
        if env:
            env = env.strip().strip('"').strip("'")
            if env.startswith("%") and env.endswith("%"):
                continue
            return env
    if SECRET_FILE.exists():
        return SECRET_FILE.read_text(encoding="utf-8").strip()
    raise SystemExit(f"No se encontró passphrase SSH en {SECRET_FILE}")


EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    ".cursor",
    ".venv",
    "memory",
    ".emergent",
}
EXCLUDE_SUFFIXES = {".pyc", ".pyo"}
EXCLUDE_NAMES = {".env"}


def should_skip(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    parts = rel.parts
    if any(p in EXCLUDE_DIRS for p in parts):
        return True
    if path.suffix in EXCLUDE_SUFFIXES:
        return True
    if path.name in EXCLUDE_NAMES:
        return True
    return False


def make_tar() -> Path:
    tmp = Path(tempfile.gettempdir()) / f"freelancer-deploy-{int(time.time())}.tar.gz"
    print(f"Creando archivo {tmp} ...", flush=True)
    with tarfile.open(tmp, "w:gz") as tar:
        for path in ROOT.rglob("*"):
            if path.is_dir() or should_skip(path):
                continue
            tar.add(path, arcname=path.relative_to(ROOT).as_posix())
    print(f"Tar listo: {tmp.stat().st_size / (1024 * 1024):.1f} MB", flush=True)
    return tmp


def connect() -> paramiko.SSHClient:
    secret = load_ssh_pass()
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    key_path = Path.home() / ".ssh" / "id_ed25519"
    if key_path.exists():
        try:
            k = paramiko.Ed25519Key.from_private_key_file(str(key_path), password=secret)
            c.connect(
                HOST,
                username="root",
                pkey=k,
                timeout=60,
                look_for_keys=False,
                allow_agent=False,
            )
            print("CONNECTED OK (clave Ed25519)", flush=True)
            return c
        except paramiko.ssh_exception.SSHException as exc:
            print(f"Clave Ed25519 falló ({exc}), probando contraseña root...", flush=True)
    c.connect(
        HOST,
        username="root",
        password=secret,
        timeout=60,
        look_for_keys=False,
        allow_agent=False,
    )
    print("CONNECTED OK (contraseña root)", flush=True)
    return c


def run(c: paramiko.SSHClient, cmd: str, timeout: int = 7200) -> int:
    print(f"\n$ {cmd}", flush=True)
    _, stdout, stderr = c.exec_command(cmd, timeout=timeout, get_pty=True)
    out = (stdout.read() + stderr.read()).decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    tail = out[-9000:] if len(out) > 9000 else out
    print(tail.encode("ascii", "replace").decode("ascii"), flush=True)
    return code


def build_env() -> str:
    jwt = secrets.token_hex(32)
    return "\n".join(
        [
            "DB_NAME=freelancer",
            f"JWT_SECRET={jwt}",
            f"FRONTEND_URL=https://{DOMAIN}",
            "ADMIN_EMAIL=admin@danielortega.com",
            "ADMIN_PASSWORD=Admin123!",
        ]
    ) + "\n"


def put_text(sftp, remote_path: str, content: str) -> None:
    with sftp.file(remote_path, "w") as f:
        f.write(content)
    print(f">> escrito {remote_path}", flush=True)


def remote_exists(sftp, remote_path: str) -> bool:
    try:
        sftp.stat(remote_path)
        return True
    except IOError:
        return False


def main() -> None:
    tar_path = make_tar()
    c = connect()

    if run(c, f"mkdir -p {REMOTE_DIR}") != 0:
        sys.exit(1)

    sftp = c.open_sftp()
    remote_tar = f"{REMOTE_DIR}/deploy.tar.gz"
    print(f"Subiendo a {remote_tar} ...", flush=True)
    sftp.put(str(tar_path), remote_tar)
    tar_path.unlink(missing_ok=True)

    pre_steps = [
        f"cd {REMOTE_DIR} && tar -xzf deploy.tar.gz && rm -f deploy.tar.gz",
        f"sed -i 's/\\r$//' {REMOTE_DIR}/deploy/ec2-https/*.sh",
        f"chmod +x {REMOTE_DIR}/deploy/ec2-https/*.sh",
    ]
    for cmd in pre_steps:
        if run(c, cmd) != 0:
            c.close()
            sys.exit(1)

    remote_env = f"{REMOTE_DIR}/.env"
    if remote_exists(sftp, remote_env):
        print(">> .env existente conservado (no se regeneran secretos)", flush=True)
    else:
        put_text(sftp, remote_env, build_env())
    sftp.close()

    steps = [
        # Swap propio de Freelancer (no toca /swapfile_netospio)
        "test -f /swapfile_freelancer || (fallocate -l 2G /swapfile_freelancer && "
        "chmod 600 /swapfile_freelancer && mkswap /swapfile_freelancer && "
        "swapon /swapfile_freelancer && "
        "(grep -q swapfile_freelancer /etc/fstab || echo '/swapfile_freelancer none swap sw 0 0' >> /etc/fstab))",
        "free -h",
        # Stack Freelancer (mongo + backend + web) — puerto solo 127.0.0.1:9090
        f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d --build",
        f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.yml ps",
        # nginx + certbot solo para www (archivo freelancer-https.conf)
        f"bash {REMOTE_DIR}/deploy/ec2-https/setup-letsencrypt-freelancer.sh {DOMAIN} {EMAIL}",
        # Asegurar cron renew (idempotente; no borra otras entradas)
        "(crontab -l 2>/dev/null | grep -q 'certbot renew' || "
        "(crontab -l 2>/dev/null; echo '0 3 * * * root certbot renew --quiet && systemctl reload nginx') | crontab -)",
        # Verificación Freelancer
        f"sleep 4; curl -skI https://{DOMAIN}/ | head -8",
        f"curl -sk https://{DOMAIN}/api/ | head -c 300; echo",
        # Regresión NetosPio / Pancita Pio
        f"curl -skI https://{PANCITA_DOMAIN}/ | head -8",
        "ls -la /etc/nginx/conf.d/",
        "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
    ]
    for cmd in steps:
        code = run(c, cmd)
        if code != 0:
            print(f"ERROR exit {code}: {cmd}", file=sys.stderr, flush=True)
            c.close()
            sys.exit(code)

    c.close()
    print("\nDEPLOY_OK", flush=True)


if __name__ == "__main__":
    main()
