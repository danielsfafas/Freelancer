import secrets, time
from datetime import datetime, timedelta, timezone
from conftest import FakeESP32, MOCK, gr, make_gate_user, panel_token, run, mac, SECRET_HEX
import server


def last_log():
    return run(MOCK.gate_log.find({}, {"_id": 0}).sort("start_epoch", -1).to_list(1))[0]


# ---------- llaves ----------
def test_llave_invalida(http, esp32, app_client):
    assert app_client(key="prt_falsa").first == {"type": "closed", "code": 4401}
    assert app_client(key="").first["code"] == 4401
    assert http.get("/gate/status").status_code == 403
    assert http.get("/gate/status", headers={"X-Gate-Key": "prt_falsa"}).status_code == 403
    assert esp32.presses == 0


def test_llave_revocada_por_admin(http, esp32, app_client):
    h = {"Authorization": f"Bearer {panel_token()}"}
    r = http.post("/gate/users", json={"name": "Temporal"}, headers=h).json()
    k = r["key"]
    assert app_client(key=k).first["type"] == "ready"
    assert http.post(f"/gate/users/{r['id']}/revoke", headers=h).status_code == 200
    assert app_client(key=k).first["code"] == 4401 and esp32.presses == 0


def test_llave_vencida(app_client):
    past = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    _, k = make_gate_user("vencido", expires_at=past)
    assert app_client(key=k).first["code"] == 4401


def test_solo_hash_guardado_y_llave_una_vez(http):
    h = {"Authorization": f"Bearer {panel_token()}"}
    r = http.post("/gate/users", json={"name": "Hash"}, headers=h).json()
    docs = run(MOCK.gate_users.find({}).to_list(1000))
    assert all(r["key"] not in str(d) for d in docs)
    assert all("key" not in u and "key_hash" not in u for u in http.get("/gate/users", headers=h).json())


# ---------- rol admin en servidor ----------
def test_rutas_admin_requieren_rol_admin(http, key, app_client):
    user_tok = panel_token(role="user")
    for hdr in ({}, {"Authorization": f"Bearer {user_tok}"}, {"X-Gate-Key": key}):
        assert http.get("/gate/users", headers=hdr).status_code == 403
        assert http.get("/gate/log", headers=hdr).status_code == 403
        assert http.post("/gate/users", json={"name": "x"}, headers=hdr).status_code == 403
    assert app_client(token=user_tok).first["code"] == 4401          # no-admin no acciona desde el panel
    adm = {"Authorization": f"Bearer {panel_token()}"}
    assert http.get("/gate/users", headers=adm).status_code == 200
    assert http.get("/gate/log", headers=adm).status_code == 200


def test_admin_acciona_desde_panel(esp32, app_client):
    a = app_client(token=panel_token())
    assert a.first["type"] == "ready" and a.press() == {"type": "on"}
    a.send("release"); assert a.recv()["reason"] == "release"
    assert last_log()["kind"] == "admin"


# ---------- hold-to-run ----------
def test_hold_to_run_y_bitacora(http, esp32, app_client, key):
    a = app_client(key=key)
    assert a.first["type"] == "ready"
    assert a.press() == {"type": "on"} and esp32.relay
    a.hold(1.0)
    assert esp32.relay
    a.send("release")
    r = a.recv()
    assert r["type"] == "released" and r["reason"] == "release"
    time.sleep(0.1)
    assert not esp32.relay and esp32.off_reason == "release"
    row = last_log()
    assert row["result"] == "ok" and row["end_reason"] == "release" and 0.9 < row["duration"] < 2
    assert row["ip"] == "127.0.0.1" and row["ack"].startswith("press:ok release:ok") and row["end"]
    s = http.get("/gate/status", headers={"X-Gate-Key": key}).json()
    assert s["device_online"] and s["last_open"]["user"] == "prueba"


def test_suelta_al_perder_heartbeat(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"
    a.hold(0.6)
    t = time.time()
    r = a.recv(3)
    assert r["type"] == "released" and r["reason"] == "hb_timeout" and time.time() - t < 1.5
    assert not esp32.relay


def test_deadman_en_esp32_aunque_api_no_suelte(esp32, app_client, key, monkeypatch):
    monkeypatch.setattr(gr.cfg, "hb_timeout", 60)
    a = app_client(key=key)
    assert a.press()["type"] == "on"
    time.sleep(1.2)
    assert not esp32.relay and esp32.off_reason == "deadman"


def test_respeta_tope(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"
    a.hold(gr.cfg.max_hold + 1.0)
    r = a.recv()
    assert r["type"] == "released" and r["reason"] == "max_hold"
    assert gr.cfg.max_hold - 0.2 < r["duration"] < gr.cfg.max_hold + 0.5
    assert not esp32.relay


def test_app_se_desconecta_suelta(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"
    a.close(); time.sleep(0.5)
    assert not esp32.relay and last_log()["end_reason"] == "app_disconnect"


def test_esp32_se_desconecta_relay_off(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"
    esp32.close()
    assert not esp32.relay
    assert a.recv()["reason"] in ("device_lost", "hb_timeout")


# ---------- límites ----------
def test_enfriamiento_por_sesion(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"; a.send("release"); a.recv()
    r = a.press()
    assert r["type"] == "denied" and "espera" in r["reason"]
    time.sleep(gr.cfg.cooldown)
    assert a.press()["type"] == "on"; a.send("release"); a.recv()


def test_rate_limit_usuario(esp32, app_client, key, monkeypatch):
    monkeypatch.setattr(gr.cfg, "cooldown", 0)
    a = app_client(key=key); res = []
    for _ in range(gr.cfg.user_max + 1):
        r = a.press(); res.append(r["type"])
        if r["type"] == "on": a.send("release"); a.recv()
    assert res == ["on"] * gr.cfg.user_max + ["denied"]


def test_rate_limit_global(esp32, app_client, monkeypatch):
    monkeypatch.setattr(gr.cfg, "cooldown", 0)
    monkeypatch.setattr(gr.cfg, "global_max", 2)
    res = []
    for i in range(3):
        a = app_client(key=make_gate_user(f"g{i}")[1]); r = a.press(); res.append(r["type"])
        if r["type"] == "on": a.send("release"); a.recv()
    assert res == ["on", "on", "denied"]


def test_una_sesion_a_la_vez(esp32, app_client, key):
    a, b = app_client(key=key), app_client(key=make_gate_user("otro")[1])
    assert a.press()["type"] == "on"
    assert b.press() == {"type": "denied", "reason": "ocupado"}
    a.send("release"); a.recv()


def test_dispositivo_desconectado_no_encola(server_addr, app_client, key):
    a = app_client(key=key)
    assert a.press() == {"type": "denied", "reason": "dispositivo desconectado"}
    assert last_log()["result"] == "fail:offline"
    d = FakeESP32(f"ws://{server_addr}/api/gate/device/ws"); d.ready.wait(5); time.sleep(0.5)
    assert d.received == [] and not d.relay
    d.close()


# ---------- protocolo ----------
def test_replay_rechazado(esp32, app_client, key):
    a = app_client(key=key)
    assert a.press()["type"] == "on"; a.hold(0.4); a.send("release"); a.recv()
    press = next(m for m in esp32.received if m["type"] == "press")
    hb = next(m for m in esp32.received if m["type"] == "hb")
    assert esp32.handle(dict(press)) == "replay" and not esp32.relay
    assert esp32.handle(dict(hb)) == "replay"
    s = bytes.fromhex(SECRET_HEX); ts = int(time.time()) - 30; ctr = esp32.counter + 5
    assert esp32.handle({"type": "press", "sid": "x", "id": "y", "ts": ts, "ctr": ctr,
                         "sig": mac(s, "cmd", "press", "x", "y", ts, ctr)}) == "stale"
    assert esp32.handle({**press, "ctr": esp32.counter + 1}) == "bad_sig"
    assert esp32.handle({**hb, "type": "press"}) == "bad_sig"
    assert not esp32.relay and esp32.presses == 1


def test_contador_monotonico(esp32, app_client, key):
    a = app_client(key=key); a.press(); a.hold(0.7); a.send("release"); a.recv()
    ctrs = [m["ctr"] for m in esp32.received]
    assert ctrs == sorted(ctrs) and len(set(ctrs)) == len(ctrs)


def test_dispositivo_con_secreto_falso(server_addr, app_client, key):
    d = FakeESP32(f"ws://{server_addr}/api/gate/device/ws", secret=b"x" * 32); d.ready.wait(5); time.sleep(0.5)
    assert d.closed_code == 4401
    assert app_client(key=key).press()["reason"] == "dispositivo desconectado"


# ---------- endurecimiento del panel ----------
def test_login_rate_limit(http):
    email = "nadie@test.local"
    codes = [http.post("/auth/login", json={"email": email, "password": "mala"}).status_code for _ in range(6)]
    assert codes[:5] == [401] * 5 and codes[5] == 429


def test_login_correcto_sigue_funcionando(http):
    pw = secrets.token_urlsafe(10)
    run(MOCK.users.insert_one({"email": "ok@test.local", "password_hash": server.hash_password(pw), "name": "ok", "role": "admin"}))
    r = http.post("/auth/login", json={"email": "ok@test.local", "password": pw})
    assert r.status_code == 200 and r.json()["token"]


def test_seed_no_reescribe_ni_usa_default(monkeypatch):
    email = server.os.environ["ADMIN_EMAIL"]
    run(MOCK.users.delete_many({"email": email}))
    monkeypatch.setenv("ADMIN_PASSWORD", "")
    run(server.startup_event())
    assert run(MOCK.users.find_one({"email": email})) is None          # sin default
    monkeypatch.setenv("ADMIN_PASSWORD", "Primera-123")
    run(server.startup_event())
    h1 = run(MOCK.users.find_one({"email": email}))["password_hash"]
    monkeypatch.setenv("ADMIN_PASSWORD", "Otra-456")
    run(server.startup_event())
    assert run(MOCK.users.find_one({"email": email}))["password_hash"] == h1   # no auto-reset
    monkeypatch.setenv("ADMIN_PASSWORD_RESET", "1")
    run(server.startup_event())
    assert server.verify_password("Otra-456", run(MOCK.users.find_one({"email": email}))["password_hash"])
