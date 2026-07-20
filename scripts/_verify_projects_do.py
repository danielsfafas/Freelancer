#!/usr/bin/env python3
from pathlib import Path
import paramiko

HOST = "174.138.47.217"
SECRET = Path(r"C:\Shared\.deploy_tmp\secret.txt").read_text(encoding="utf-8").strip()

CMDS = [
    "curl -sk https://www.danysolutions.online/api/",
    "curl -sk https://www.danysolutions.online/api/projects | python3 -c \"import sys,json; d=json.load(sys.stdin); print(len(d)); [print(p.get('title'), p.get('demo_url'), p.get('image_url')) for p in d]\"",
    "curl -skI https://www.danysolutions.online/portfolio-logos/podologia.png | head -5",
    "curl -skI https://pancitapio.danysolutions.online/ | head -5",
    "test -f /etc/nginx/conf.d/netospio-https.conf && echo netospio_ok",
    "test -f /etc/nginx/conf.d/freelancer-https.conf && echo freelancer_ok",
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
