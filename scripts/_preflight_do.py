#!/usr/bin/env python3
from pathlib import Path
import paramiko

HOST = "174.138.47.217"
SECRET = Path(r"C:\Shared\.deploy_tmp\secret.txt").read_text(encoding="utf-8").strip()

CMDS = [
    'echo === docker ps ===; docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"',
    "echo === nginx conf.d ===; ls -la /etc/nginx/conf.d/",
    "echo === ports ===; ss -lntp | grep -E ':(80|443|9082|9083|9090|8788|8081)\\b' || true",
    "echo === pancita ===; curl -skI https://pancitapio.danysolutions.online/ | head -8",
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
