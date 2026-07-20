#!/usr/bin/env python3
from pathlib import Path
import paramiko

HOST = "174.138.47.217"
SECRET = Path(r"C:\Shared\.deploy_tmp\secret.txt").read_text(encoding="utf-8").strip()

CMDS = [
    "curl -skI https://www.danysolutions.online/ | head -8",
    "curl -sk https://www.danysolutions.online/api/",
    "curl -skI https://pancitapio.danysolutions.online/ | head -8",
    "test -f /etc/nginx/conf.d/netospio-https.conf && echo netospio_conf_ok",
    "test -f /etc/nginx/conf.d/freelancer-https.conf && echo freelancer_conf_ok",
    "test -f /etc/letsencrypt/live/www.danysolutions.online/fullchain.pem && echo cert_ok",
    'docker ps --filter name=freelancer --format "{{.Names}} {{.Status}}"',
    'docker ps --filter name=netospio --format "{{.Names}} {{.Status}}"',
]

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
k = paramiko.Ed25519Key.from_private_key_file(
    str(Path.home() / ".ssh" / "id_ed25519"), password=SECRET
)
c.connect(HOST, username="root", pkey=k, timeout=60, look_for_keys=False, allow_agent=False)
for cmd in CMDS:
    print(f"\n$ {cmd}")
    _, o, e = c.exec_command(cmd, timeout=60, get_pty=True)
    print((o.read() + e.read()).decode("utf-8", "replace"))
c.close()
