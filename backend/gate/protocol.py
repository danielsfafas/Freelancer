"""Protocolo firmado API <-> ESP32 (HMAC-SHA256 con GATE_DEVICE_SECRET).
hello: mac = HMAC(s, "hello|<ts>|<nonce>")                               (ESP32 -> API)
cmd  : sig = HMAC(s, "cmd|<op>|<sid>|<id>|<ts>|<ctr>")  op = press|hb|release  (API -> ESP32)
ack  : sig = HMAC(s, "ack|<id>|<ctr>|<result>")                          (ESP32 -> API)
ctr: entero monotónico (milisegundos epoch, mínimo +1).
"""
import hashlib
import hmac


def mac(secret: bytes, *parts) -> str:
    return hmac.new(secret, "|".join(str(p) for p in parts).encode(), hashlib.sha256).hexdigest()


def ok(secret: bytes, sig, *parts) -> bool:
    return isinstance(sig, str) and hmac.compare_digest(mac(secret, *parts), sig)


def hash_key(key: str) -> str:
    # Llaves de 256 bits de entropía: SHA-256 basta (no son contraseñas).
    return hashlib.sha256(key.encode()).hexdigest()
