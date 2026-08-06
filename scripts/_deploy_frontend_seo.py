#!/usr/bin/env python3
"""Deploy solo el build SEO del frontend Freelancer a freelancer-web."""
from __future__ import annotations

import os
import tarfile
import tempfile
from pathlib import Path

import paramiko

HOST = "174.138.47.217"
REMOTE_TAR = "/tmp/freelancer-web-build.tar.gz"
BUILD = Path(__file__).resolve().parents[1] / "frontend" / "build"
KEY = Path.home() / ".ssh" / "id_ed25519"
SECRET_FILE = Path(r"C:\Shared\.deploy_tmp\secret.txt")


def load_pass() -> str:
    for var in ("passdigitalocean", "PASSDIGITALOCEAN"):
        env = os.environ.get(var)
        if env and not (env.startswith("%") and env.endswith("%")):
            return env.strip().strip('"').strip("'")
    if SECRET_FILE.exists():
        return SECRET_FILE.read_text(encoding="utf-8").strip()
    return "digitalocean"


def main() -> None:
    if not (BUILD / "index.html").is_file():
        raise SystemExit("Falta frontend/build — corre npm run build")

    with tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False) as tmp:
        tar_path = Path(tmp.name)
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(BUILD, arcname="build")
    print(f"tar {tar_path.stat().st_size // 1024} KB", flush=True)

    secret = load_pass()
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        k = paramiko.Ed25519Key.from_private_key_file(str(KEY), password=secret)
        c.connect(HOST, username="root", pkey=k, timeout=60, allow_agent=False, look_for_keys=False)
    except Exception:
        k = paramiko.Ed25519Key.from_private_key_file(str(KEY), password="digitalocean")
        c.connect(HOST, username="root", pkey=k, timeout=60, allow_agent=False, look_for_keys=False)

    sftp = c.open_sftp()
    sftp.put(str(tar_path), REMOTE_TAR)
    sftp.close()
    tar_path.unlink(missing_ok=True)

    _, o, e = c.exec_command(
        f"""
set -e
rm -rf /tmp/freelancer-web-build
mkdir -p /tmp/freelancer-web-build
tar xzf {REMOTE_TAR} -C /tmp/freelancer-web-build
docker exec freelancer-web sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp /tmp/freelancer-web-build/build/. freelancer-web:/usr/share/nginx/html/
rm -rf /tmp/freelancer-web-build {REMOTE_TAR}
docker exec freelancer-web sh -c 'ls /usr/share/nginx/html/index.html /usr/share/nginx/html/robots.txt /usr/share/nginx/html/sitemap.xml /usr/share/nginx/html/og-share.png'
docker exec freelancer-web sh -c 'grep -o Tepeapulco /usr/share/nginx/html/index.html | head -3'
curl -skI https://www.danysolutions.online/ | head -8
curl -sk https://www.danysolutions.online/robots.txt | head -6
curl -sk https://www.danysolutions.online/sitemap.xml | head -12
echo DEPLOY_OK
""",
        timeout=300,
    )
    print((o.read() + e.read()).decode("utf-8", "replace"), flush=True)
    code = o.channel.recv_exit_status()
    c.close()
    if code != 0:
        raise SystemExit(code)


if __name__ == "__main__":
    main()
