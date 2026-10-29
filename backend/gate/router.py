"""Portón: rutas /api/gate/*.

- Familiares: llave personal (X-Gate-Key / auth por WebSocket). Solo pueden accionar y ver estado.
- Admin del panel (role == "admin", verificado en servidor): todo lo anterior + usuarios + bitácora.
- ESP32: WebSocket saliente /api/gate/device/ws autenticado con HMAC (GATE_DEVICE_SECRET).
Una sola instancia del backend (el estado del dispositivo vive en memoria).
"""
import asyncio
import logging
import os
import secrets
import time
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, WebSocket
from pydantic import BaseModel

from .protocol import hash_key, mac, ok

logger = logging.getLogger("gate")
router = APIRouter(prefix="/gate")


def _env_float(name, default):
    return float(os.environ.get(name, default))


class Cfg:
    secret: Optional[bytes] = None
    cooldown = _env_float("GATE_COOLDOWN_S", 10)        # entre inicios de presión
    max_hold = _env_float("GATE_MAX_HOLD_S", 30)        # tope absoluto por presión
    hb_timeout = _env_float("GATE_HB_TIMEOUT_S", 0.8)   # dead-man del lado servidor
    user_max = int(os.environ.get("GATE_USER_PER_MIN", 4))
    global_max = int(os.environ.get("GATE_GLOBAL_PER_MIN", 12))
    proxy_hops = int(os.environ.get("TRUSTED_PROXY_HOPS", 2))  # nginx host + nginx del contenedor
    window = 60
    ack_timeout = 3.0


cfg = Cfg()
_db = None
_user_from_token = None   # async (token) -> dict usuario del panel o excepción


def configure(db, user_from_token):
    global _db, _user_from_token
    _db, _user_from_token = db, user_from_token
    raw = os.environ.get("GATE_DEVICE_SECRET", "").strip()
    try:
        cfg.secret = bytes.fromhex(raw) if len(raw) >= 64 else None
    except ValueError:
        cfg.secret = None
    if cfg.secret is None:
        logger.warning("GATE_DEVICE_SECRET no configurado: el portón queda deshabilitado")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def client_ip(conn) -> str:
    xff = [p.strip() for p in conn.headers.get("x-forwarded-for", "").split(",") if p.strip()]
    if cfg.proxy_hops and len(xff) >= cfg.proxy_hops:
        return xff[-cfg.proxy_hops]
    return conn.client.host if conn.client else "?"


# ---------------- estado en memoria ----------------
class Device:
    ws: Optional[WebSocket] = None
    pending: dict = {}
    last_seen = 0.0
    ctr = 0
    send_lock: Optional[asyncio.Lock] = None


dev = Device()
hits_user: dict = {}
hits_global: deque = deque()
state = {"last_start": 0.0, "session": None}


def reset_state():
    """Para pruebas."""
    hits_user.clear(); hits_global.clear()
    state["last_start"] = 0.0; state["session"] = None


def _allow(q: deque, limit: int, now: float) -> bool:
    while q and q[0] < now - cfg.window:
        q.popleft()
    if len(q) >= limit:
        return False
    q.append(now)
    return True


def _next_ctr() -> int:
    dev.ctr = max(dev.ctr + 1, int(time.time() * 1000))
    return dev.ctr


# ---------------- persistencia (Mongo) ----------------
async def log_event(who, ip, result, ack=None, start=None, end=None, reason=None):
    start = start or time.time()
    await _db.gate_log.insert_one({
        "id": str(uuid.uuid4()),
        "ts": datetime.fromtimestamp(start, timezone.utc).isoformat(),
        "start_epoch": start,
        "user": who.get("name") if who else None,
        "user_id": who.get("id") if who else None,
        "kind": who.get("kind") if who else None,
        "ip": ip, "result": result, "ack": ack,
        "end": datetime.fromtimestamp(end, timezone.utc).isoformat() if end else None,
        "duration": round(end - start, 2) if end else None,
        "end_reason": reason,
    })


async def find_key_user(key: str):
    if not key or not isinstance(key, str) or len(key) > 200:
        return None
    u = await _db.gate_users.find_one({"key_hash": hash_key(key), "revoked_at": None}, {"_id": 0, "key_hash": 0})
    if not u:
        return None
    if u.get("expires_at") and u["expires_at"] <= now_iso():
        return None
    return {"id": u["id"], "name": u["name"], "kind": "key"}


async def find_admin(token: str):
    if not token or _user_from_token is None:
        return None
    try:
        u = await _user_from_token(token)
    except Exception:
        return None
    if u.get("role") != "admin":
        return None
    return {"id": u["id"], "name": u.get("name") or u["email"], "kind": "admin"}


async def require_admin(request: Request):
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    u = await find_admin(token)
    if not u:
        raise HTTPException(status_code=403, detail="Solo administradores")
    return u


# ---------------- comandos al ESP32 ----------------
async def send_cmd(op: str, sid: str, want_ack=False):
    ws = dev.ws
    if ws is None or cfg.secret is None:
        return "offline"
    if dev.send_lock is None:
        dev.send_lock = asyncio.Lock()
    cid, ts, ctr = secrets.token_hex(8), int(time.time()), _next_ctr()
    fut = None
    if want_ack:
        fut = asyncio.get_running_loop().create_future()
        dev.pending[cid] = fut
    try:
        async with dev.send_lock:
            await ws.send_json({"type": op, "sid": sid, "id": cid, "ts": ts, "ctr": ctr,
                                "sig": mac(cfg.secret, "cmd", op, sid, cid, ts, ctr)})
        return await asyncio.wait_for(fut, cfg.ack_timeout) if fut else "sent"
    except Exception:
        return "timeout" if fut else "error"
    finally:
        dev.pending.pop(cid, None)


class Session:
    def __init__(self, who, ip, app_ws):
        self.sid, self.who, self.ip, self.app_ws = secrets.token_hex(8), who, ip, app_ws
        self.start = time.time(); self.last_hb = self.start; self.ack = None; self.ended = False

    async def watchdog(self):
        while not self.ended:
            await asyncio.sleep(0.1)
            now = time.time()
            if now - self.start >= cfg.max_hold:
                await end_session(self, "max_hold"); break
            if now - self.last_hb > cfg.hb_timeout:
                await end_session(self, "hb_timeout"); break
            if dev.ws is None:
                await end_session(self, "device_lost"); break


async def end_session(s: Session, reason: str):
    if s.ended:
        return
    s.ended = True
    if state["session"] is s:
        state["session"] = None
    rel = await send_cmd("release", s.sid, want_ack=True)
    end = time.time()
    await log_event(s.who, s.ip, "ok", f"press:{s.ack} release:{rel}", s.start, end, reason)
    try:
        await s.app_ws.send_json({"type": "released", "reason": reason, "duration": round(end - s.start, 2)})
    except Exception:
        pass


# ---------------- WebSocket de la app (panel o PWA familiar) ----------------
@router.websocket("/app/ws")
async def app_ws(ws: WebSocket):
    await ws.accept()
    ip = client_ip(ws)
    who = None
    try:
        m = await asyncio.wait_for(ws.receive_json(), 5)
        if m.get("type") == "auth":
            who = await find_key_user(m.get("key")) if m.get("key") else await find_admin(m.get("token"))
    except Exception:
        who = None
    if not who:
        await log_event(None, ip, "denied:auth")
        await asyncio.sleep(0.3)
        await ws.close(code=4401)
        return
    await ws.send_json({"type": "ready", "max_hold": cfg.max_hold, "name": who["name"]})
    mine: Optional[Session] = None
    try:
        while True:
            m = await asyncio.wait_for(ws.receive_json(), 120)
            t = m.get("type")
            if t == "press":
                if mine and not mine.ended:
                    continue
                reason = await _check_press(who, ip)
                if reason:
                    await ws.send_json({"type": "denied", "reason": reason})
                    continue
                state["last_start"] = time.time()
                mine = state["session"] = Session(who, ip, ws)
                mine.ack = await send_cmd("press", mine.sid, want_ack=True)
                if mine.ack != "ok":
                    await end_session(mine, "no_ack")
                    continue
                mine.last_hb = time.time()
                asyncio.create_task(mine.watchdog())
                await ws.send_json({"type": "on"})
            elif t == "hb" and mine and not mine.ended:
                mine.last_hb = time.time()
                await send_cmd("hb", mine.sid)
            elif t == "release" and mine and not mine.ended:
                await end_session(mine, "release")
    except Exception:
        pass
    finally:
        if mine and not mine.ended:
            await end_session(mine, "app_disconnect")


async def _check_press(who, ip):
    now = time.time()
    if state["session"] is not None:
        return "ocupado"
    if now - state["last_start"] < cfg.cooldown:
        await log_event(who, ip, "denied:cooldown"); return "espera unos segundos"
    if not _allow(hits_user.setdefault(who["id"], deque()), cfg.user_max, now) or not _allow(hits_global, cfg.global_max, now):
        await log_event(who, ip, "denied:rate"); return "demasiadas solicitudes"
    if dev.ws is None:
        await log_event(who, ip, "fail:offline"); return "dispositivo desconectado"  # nunca se encola
    return None


# ---------------- WebSocket del ESP32 ----------------
@router.websocket("/device/ws")
async def device_ws(ws: WebSocket):
    await ws.accept()
    try:
        if cfg.secret is None:
            raise ValueError("sin secreto")
        h = await asyncio.wait_for(ws.receive_json(), 5)
        ts = int(h.get("ts", 0))
        if h.get("type") != "hello" or abs(time.time() - ts) > 30 or not ok(cfg.secret, h.get("mac"), "hello", ts, h.get("nonce", "")):
            raise ValueError("hello inválido")
    except Exception:
        await ws.close(code=4401)
        return
    old, dev.ws, dev.last_seen = dev.ws, ws, time.time()
    if old is not None:
        try:
            await old.close(code=4000)
        except Exception:
            pass
    try:
        while True:
            m = await asyncio.wait_for(ws.receive_json(), 90)   # ping del ESP32 cada 30 s
            dev.last_seen = time.time()
            if m.get("type") == "ack":
                cid, ctr, res = str(m.get("id")), m.get("ctr"), str(m.get("result"))
                f = dev.pending.get(cid)
                if f and not f.done() and ok(cfg.secret, m.get("sig"), "ack", cid, ctr, res):
                    f.set_result(res)
    except Exception:
        pass
    finally:
        if dev.ws is ws:
            dev.ws = None
        for f in list(dev.pending.values()):
            if not f.done():
                f.set_result("disconnected")


# ---------------- HTTP ----------------
async def _status_payload():
    last = await _db.gate_log.find({"result": "ok"}, {"_id": 0, "user": 1, "ts": 1, "duration": 1}).sort("start_epoch", -1).to_list(1)
    return {
        "configured": cfg.secret is not None,
        "device_online": dev.ws is not None,
        "last_seen": datetime.fromtimestamp(dev.last_seen, timezone.utc).isoformat() if dev.last_seen else None,
        "last_open": last[0] if last else None,
        "active": state["session"] is not None,
        "cooldown_s": max(0, round(cfg.cooldown - (time.time() - state["last_start"]))),
        "max_hold_s": cfg.max_hold,
    }


@router.get("/status")
async def gate_status(request: Request, x_gate_key: str = Header(default="")):
    who = await find_key_user(x_gate_key) if x_gate_key else None
    if not who:
        await require_admin(request)
    return await _status_payload()


class GateUserCreate(BaseModel):
    name: str
    expires_at: Optional[str] = None   # ISO 8601; vacío = sin vencimiento


@router.get("/users")
async def list_gate_users(admin: dict = Depends(require_admin)):
    return await _db.gate_users.find({}, {"_id": 0, "key_hash": 0}).sort("created_at", -1).to_list(500)


@router.post("/users")
async def create_gate_user(body: GateUserCreate, admin: dict = Depends(require_admin)):
    name = body.name.strip()[:60]
    if not name:
        raise HTTPException(status_code=400, detail="Nombre requerido")
    expires = None
    if body.expires_at:
        try:
            d = datetime.fromisoformat(body.expires_at.replace("Z", "+00:00"))
            expires = (d if d.tzinfo else d.replace(tzinfo=timezone.utc)).astimezone(timezone.utc).isoformat()
        except ValueError:
            raise HTTPException(status_code=400, detail="Fecha de vencimiento inválida")
    key = "prt_" + secrets.token_urlsafe(32)
    doc = {"id": str(uuid.uuid4()), "name": name, "key_hash": hash_key(key), "created_at": now_iso(),
           "created_by": admin["name"], "expires_at": expires, "revoked_at": None}
    await _db.gate_users.insert_one(doc)
    out = {k: v for k, v in doc.items() if k not in ("_id", "key_hash")}
    out["key"] = key   # se muestra UNA sola vez
    return out


@router.post("/users/{user_id}/revoke")
async def revoke_gate_user(user_id: str, admin: dict = Depends(require_admin)):
    r = await _db.gate_users.update_one({"id": user_id, "revoked_at": None}, {"$set": {"revoked_at": now_iso()}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="No existe o ya estaba revocado")
    return {"message": "Acceso revocado"}


@router.get("/log")
async def gate_log(limit: int = 100, admin: dict = Depends(require_admin)):
    limit = max(1, min(limit, 500))
    return await _db.gate_log.find({}, {"_id": 0}).sort("start_epoch", -1).to_list(limit)
