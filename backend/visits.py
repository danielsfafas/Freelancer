"""Contador de visitas propio (first-party) y anónimo.

- POST /api/visits/track : registra una vista de página pública.
  No guarda IP ni user-agent. Para estimar visitantes únicos se guarda un hash
  SHA-256 de (sal diaria aleatoria + IP + user-agent); la sal cambia cada día y
  se borra, así que el hash no permite reidentificar ni enlazar días distintos.
  Respeta Do Not Track / Global Privacy Control y excluye bots y rutas de admin.
- GET /api/visits/stats  : estadísticas agregadas, solo para usuarios autenticados.
"""
import hashlib
import re
import secrets
import time
from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, Response

router = APIRouter(prefix="/visits", tags=["visits"])

# México (centro) no tiene horario de verano desde 2022: UTC-6 fijo.
MX_TZ = timezone(timedelta(hours=-6))
RETENTION_DAYS = 400
OWN_HOSTS = {"danysolutions.online", "www.danysolutions.online", "localhost", "127.0.0.1"}
EXCLUDED_PREFIXES = ("/admin", "/porton", "/api", "/uploads")
BOT_RE = re.compile(
    r"bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|"
    r"telegram|discord|skype|preview|headless|phantom|lighthouse|pagespeed|gtmetrix|curl|wget|"
    r"python-requests|httpx|aiohttp|go-http|java/|okhttp|axios|node-fetch|postman|monitor|uptime|scan",
    re.I,
)

_db = None
_auth_dep: Optional[Callable] = None
_salt = {"day": None, "value": None}
_rate: dict = {}


def configure(db, auth_dependency):
    global _db, _auth_dep
    _db = db
    _auth_dep = auth_dependency


async def _auth(request: Request):
    return await _auth_dep(request)


async def ensure_indexes(db):
    await db.page_views.create_index("day")
    await db.page_views.create_index("ts", expireAfterSeconds=RETENTION_DAYS * 86400)


def _today() -> str:
    return datetime.now(MX_TZ).strftime("%Y-%m-%d")


def _daily_salt(day: str) -> str:
    if _salt["day"] != day:
        _salt["day"], _salt["value"] = day, secrets.token_hex(16)
    return _salt["value"]


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.headers.get("x-real-ip") or (request.client.host if request.client else "")


def _device(ua: str) -> str:
    u = ua.lower()
    if "ipad" in u or "tablet" in u or ("android" in u and "mobile" not in u):
        return "tablet"
    if "mobi" in u or "iphone" in u or "android" in u:
        return "mobile"
    return "desktop"


def _clean_path(p: str) -> Optional[str]:
    if not isinstance(p, str) or not p.startswith("/"):
        return None
    p = p.split("?")[0].split("#")[0][:200]
    if len(p) > 1:
        p = p.rstrip("/")
    if p.lower().startswith(EXCLUDED_PREFIXES):
        return None
    return p or "/"


def _ref_domain(ref: str) -> str:
    if not isinstance(ref, str) or not ref:
        return ""
    try:
        host = (urlparse(ref).hostname or "").lower()
    except Exception:
        return ""
    if host.startswith("www."):
        host = host[4:]
    if not host or host in OWN_HOSTS or host == "danysolutions.online":
        return ""
    return host[:100]


def _rate_limited(key: str, limit: int = 60, window: float = 60.0) -> bool:
    now = time.monotonic()
    q = _rate.setdefault(key, deque())
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    if len(_rate) > 5000:
        _rate.clear()
    return False


@router.post("/track", status_code=204)
async def track(request: Request):
    # Do Not Track / Global Privacy Control
    if request.headers.get("dnt") == "1" or request.headers.get("sec-gpc") == "1":
        return Response(status_code=204)
    ua = request.headers.get("user-agent", "")
    if not ua or BOT_RE.search(ua):
        return Response(status_code=204)
    try:
        data = await request.json()
    except Exception:
        return Response(status_code=204)
    if not isinstance(data, dict):
        return Response(status_code=204)
    path = _clean_path(data.get("path", ""))
    if not path:
        return Response(status_code=204)
    ip = _client_ip(request)
    day = _today()
    vh = hashlib.sha256(f"{_daily_salt(day)}|{ip}|{ua}".encode()).hexdigest()[:20]
    if _rate_limited(vh):
        return Response(status_code=204)
    await _db.page_views.insert_one({
        "ts": datetime.now(timezone.utc),
        "day": day,
        "path": path,
        "ref": _ref_domain(data.get("referrer", "")),
        "device": _device(ua),
        "vh": vh,
    })
    return Response(status_code=204)


async def _count(match: dict) -> dict:
    res = await _db.page_views.aggregate([
        {"$match": match},
        {"$group": {"_id": None, "views": {"$sum": 1}, "v": {"$addToSet": {"d": "$day", "h": "$vh"}}}},
        {"$project": {"views": 1, "visitors": {"$size": "$v"}}},
    ]).to_list(1)
    return {"views": res[0]["views"], "visitors": res[0]["visitors"]} if res else {"views": 0, "visitors": 0}


async def _top(field: str, match: dict, n: int = 8) -> list:
    rows = await _db.page_views.aggregate([
        {"$match": match},
        {"$group": {"_id": f"${field}", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": n},
    ]).to_list(n)
    return [{"name": r["_id"] or "", "views": r["views"]} for r in rows]


@router.get("/stats")
async def stats(days: int = 30, user: dict = Depends(_auth)):
    if days not in (7, 30, 90):
        raise HTTPException(status_code=400, detail="days debe ser 7, 30 o 90")
    now = datetime.now(MX_TZ)
    def d(n):
        return (now - timedelta(days=n)).strftime("%Y-%m-%d")
    today = d(0)
    start = d(days - 1)

    rng = {"day": {"$gte": start}}
    series_rows = await _db.page_views.aggregate([
        {"$match": rng},
        {"$group": {"_id": "$day", "views": {"$sum": 1}, "v": {"$addToSet": "$vh"}}},
        {"$project": {"views": 1, "visitors": {"$size": "$v"}}},
    ]).to_list(400)
    by_day = {r["_id"]: r for r in series_rows}
    series = []
    for i in range(days - 1, -1, -1):
        k = d(i)
        r = by_day.get(k, {})
        series.append({"day": k, "views": r.get("views", 0), "visitors": r.get("visitors", 0)})

    first = await _db.page_views.find_one({}, sort=[("ts", 1)], projection={"day": 1})
    referrers = await _top("ref", {**rng, "ref": {"$ne": ""}})
    direct = await _db.page_views.count_documents({**rng, "ref": ""})
    return {
        "range_days": days,
        "today": await _count({"day": today}),
        "last7": await _count({"day": {"$gte": d(6)}}),
        "last30": await _count({"day": {"$gte": d(29)}}),
        "total": await _count({}),
        "since": first["day"] if first else None,
        "series": series,
        "top_pages": await _top("path", rng),
        "top_referrers": referrers,
        "direct": direct,
        "devices": await _top("device", rng, 3),
    }
