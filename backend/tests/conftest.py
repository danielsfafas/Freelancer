"""Pruebas del módulo Portón y del endurecimiento mínimo del login.
Usan mongomock-motor (sin MongoDB real) y un ESP32 simulado con la misma lógica que el firmware.
Ejecutar: cd backend && pip install -r requirements.txt -r requirements-test.txt && pytest -q tests
"""
import asyncio, importlib, json, os, secrets, socket, sys, threading, time
from pathlib import Path
import pytest

SECRET_HEX = secrets.token_hex(32)  # efímero, solo pruebas
os.environ.update({
    "MONGO_URL": "mongodb://127.0.0.1:1", "DB_NAME": "test_gate", "JWT_SECRET": secrets.token_hex(32),
    "GATE_DEVICE_SECRET": SECRET_HEX, "GATE_COOLDOWN_S": "0.5", "GATE_MAX_HOLD_S": "2",
    "TRUSTED_PROXY_HOPS": "0", "ADMIN_EMAIL": "admin@test.local", "ADMIN_PASSWORD": secrets.token_urlsafe(12),
    "LOGIN_MAX_PER_IP": "5",
})
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import uvicorn, httpx, websockets
from mongomock_motor import AsyncMongoMockClient
import server
gr = importlib.import_module("gate.router")
from gate.protocol import mac, ok

MOCK = AsyncMongoMockClient()["test_gate"]
server.db = MOCK
server.gate.configure(MOCK, server.user_from_token)


def _port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


@pytest.fixture(scope="session")
def server_addr():
    port = _port()
    srv = uvicorn.Server(uvicorn.Config(server.app, host="127.0.0.1", port=port, log_level="warning"))
    th = threading.Thread(target=srv.run, daemon=True); th.start()
    for _ in range(200):
        if srv.started: break
        time.sleep(0.05)
    yield f"127.0.0.1:{port}"
    srv.should_exit = True; th.join(5)


@pytest.fixture(autouse=True)
def reset(server_addr):
    gr.reset_state()
    server._login_fail_ip.clear(); server._login_fail_email.clear()
    yield


@pytest.fixture
def http(server_addr):
    with httpx.Client(base_url=f"http://{server_addr}/api", timeout=10) as c:
        yield c


def run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def make_gate_user(name="prueba", expires_at=None):
    """Crea un usuario con llave directamente en la BD; devuelve (id, llave)."""
    key = "prt_" + secrets.token_urlsafe(32)
    uid = secrets.token_hex(6)
    run(MOCK.gate_users.insert_one({"id": uid, "name": name, "key_hash": gr.hash_key(key), "created_at": gr.now_iso(),
                                     "expires_at": expires_at, "revoked_at": None}))
    return uid, key


@pytest.fixture
def key():
    return make_gate_user()[1]


def panel_token(role="admin"):
    email = f"{role}-{secrets.token_hex(3)}@test.local"
    r = run(MOCK.users.insert_one({"email": email, "password_hash": server.hash_password("x"), "name": role, "role": role}))
    return server.create_access_token(str(r.inserted_id), email)


class FakeESP32:
    """Misma lógica que esp32/porton.ino: firma, ts ±10 s, contador monotónico,
    dead-man de 800 ms, tope de presión y relé OFF al perder el WS."""
    DEADMAN, MAX_HOLD = 0.8, 2.5

    def __init__(self, url, secret=None):
        self.url, self.secret = url, secret or bytes.fromhex(SECRET_HEX)
        self.counter = 0; self.relay = False; self.sid = None; self.on_at = 0; self.last_hb = 0
        self.received = []; self.rejected = []; self.presses = 0; self.off_reason = None
        self.closed_code = None; self.ws = None; self.ready = threading.Event()
        self.loop = asyncio.new_event_loop()
        threading.Thread(target=self.loop.run_forever, daemon=True).start()
        asyncio.run_coroutine_threadsafe(self._run(), self.loop)
        asyncio.run_coroutine_threadsafe(self._deadman(), self.loop)

    def off(self, why):
        if self.relay: self.off_reason = why
        self.relay = False; self.sid = None

    def handle(self, m):
        op, sid, ts, ctr = m.get("type"), m.get("sid"), int(m.get("ts", 0)), int(m.get("ctr", 0))
        if not ok(self.secret, m.get("sig"), "cmd", op, sid, m.get("id"), ts, ctr): return "bad_sig"
        if abs(time.time() - ts) > 10: return "stale"
        if ctr <= self.counter: return "replay"
        self.counter = ctr
        now = time.monotonic()
        if op == "press":
            self.relay, self.sid, self.on_at, self.last_hb = True, sid, now, now; self.presses += 1
        elif op == "hb":
            if not self.relay or sid != self.sid: return "no_session"
            self.last_hb = now
        elif op == "release":
            if sid == self.sid or not self.relay: self.off("release")
        else:
            return "bad_op"
        return "ok"

    async def _deadman(self):
        while True:
            await asyncio.sleep(0.05)
            now = time.monotonic()
            if self.relay and now - self.last_hb > self.DEADMAN: self.off("deadman")
            if self.relay and now - self.on_at > self.MAX_HOLD: self.off("max_hold")

    async def _run(self):
        try:
            async with websockets.connect(self.url) as ws:
                self.ws = ws
                nonce, ts = secrets.token_hex(8), int(time.time())
                await ws.send(json.dumps({"type": "hello", "ts": ts, "nonce": nonce, "mac": mac(self.secret, "hello", ts, nonce)}))
                self.ready.set()
                async for raw in ws:
                    m = json.loads(raw); self.received.append(m)
                    res = self.handle(m)
                    if res != "ok": self.rejected.append(res)
                    if m.get("type") in ("press", "release"):
                        await ws.send(json.dumps({"type": "ack", "id": m.get("id"), "ctr": m.get("ctr"), "result": res,
                                                  "sig": mac(self.secret, "ack", m.get("id"), m.get("ctr"), res)}))
        except websockets.ConnectionClosed:
            pass
        finally:
            self.closed_code = self.ws.close_code if self.ws else None
            self.off("ws_lost")

    def close(self):
        if self.ws: asyncio.run_coroutine_threadsafe(self.ws.close(), self.loop).result(5)
        time.sleep(0.2)


@pytest.fixture
def esp32(server_addr):
    d = FakeESP32(f"ws://{server_addr}/api/gate/device/ws"); assert d.ready.wait(5); time.sleep(0.2)
    yield d
    d.close()


class AppClient:
    """Simula la PWA /porton o la sección del panel por WebSocket."""
    def __init__(self, addr, key=None, token=None):
        from websockets.sync.client import connect
        self.ws = connect(f"ws://{addr}/api/gate/app/ws", open_timeout=5)
        self.ws.send(json.dumps({"type": "auth", "key": key} if key is not None else {"type": "auth", "token": token}))
        self.first = self.recv()
    def send(self, t): self.ws.send(json.dumps({"type": t}))
    def recv(self, timeout=5):
        try: return json.loads(self.ws.recv(timeout))
        except websockets.ConnectionClosed as e: return {"type": "closed", "code": e.rcvd.code if e.rcvd else None}
    def press(self):
        self.send("press"); return self.recv()
    def hold(self, seconds, every=0.3):
        end = time.time() + seconds
        while time.time() < end:
            self.send("hb"); time.sleep(every)
    def close(self): self.ws.close()


@pytest.fixture
def app_client(server_addr):
    made = []
    def make(key=None, token=None):
        c = AppClient(server_addr, key=key, token=token); made.append(c); return c
    yield make
    for c in made:
        try: c.close()
        except Exception: pass
