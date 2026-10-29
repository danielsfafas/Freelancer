/*  Portón hold-to-run – ESP32
    Librerías: "WebSockets" (Markus Sattler/Links2004) y "ArduinoJson" v7.
    Seguridad del relé:
      - El pin se pone en INACTIVO antes de configurarlo como salida (arranque / tras corte de luz = OFF).
      - Relé ON solo tras un "press" firmado válido; se mantiene mientras lleguen "hb" válidos.
      - OFF si: release, sin hb > DEADMAN_MS, presión > MAX_HOLD_MS, cae WiFi o WS, reinicio, watchdog.
*/
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <esp_task_wdt.h>
#include <time.h>
#include "mbedtls/md.h"
#include "secrets.h"

#define RELAY_ON_LEVEL  (RELAY_ACTIVE_HIGH ? HIGH : LOW)
#define RELAY_OFF_LEVEL (RELAY_ACTIVE_HIGH ? LOW : HIGH)
#define WDT_TIMEOUT_S 8

WebSocketsClient ws;
Preferences prefs;
uint8_t secretKey[32];
uint64_t lastCtr = 0;          // último contador aceptado (RAM)
bool relayOn = false;
String sessionId;
uint32_t onAt = 0, lastHb = 0;
bool wsUp = false;
uint32_t backoffMs = 1000, nextTry = 0;

void relayOff() { digitalWrite(RELAY_PIN, RELAY_OFF_LEVEL); relayOn = false; sessionId = ""; }
void relaySetOn() { digitalWrite(RELAY_PIN, RELAY_ON_LEVEL); relayOn = true; }

void hexToBytes(const char* hex, uint8_t* out, size_t n) {
  for (size_t i = 0; i < n; i++) { char b[3] = {hex[2*i], hex[2*i+1], 0}; out[i] = strtoul(b, nullptr, 16); }
}
String hmacHex(const String& msg) {
  uint8_t out[32];
  mbedtls_md_hmac(mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), secretKey, 32,
                  (const uint8_t*)msg.c_str(), msg.length(), out);
  char hex[65]; for (int i = 0; i < 32; i++) sprintf(hex + 2*i, "%02x", out[i]); hex[64] = 0;
  return String(hex);
}
bool ctEq(const String& a, const String& b) {      // comparación en tiempo constante
  if (a.length() != b.length()) return false;
  uint8_t d = 0; for (size_t i = 0; i < a.length(); i++) d |= a[i] ^ b[i];
  return d == 0;
}
String u64(uint64_t v) { char b[24]; snprintf(b, sizeof b, "%llu", (unsigned long long)v); return String(b); }

bool timeValid() { return time(nullptr) > 1700000000; }

void sendAck(const String& id, uint64_t ctr, const char* result) {
  String c = u64(ctr);
  JsonDocument d;
  d["type"] = "ack"; d["id"] = id; d["ctr"] = ctr; d["result"] = result;
  d["sig"] = hmacHex("ack|" + id + "|" + c + "|" + result);
  String out; serializeJson(d, out); ws.sendTXT(out);
}

const char* handleCmd(JsonDocument& m) {
  String op = m["type"] | "", sid = m["sid"] | "", id = m["id"] | "", sig = m["sig"] | "";
  long ts = m["ts"] | 0L; uint64_t ctr = m["ctr"] | (uint64_t)0;
  if (!ctEq(hmacHex("cmd|" + op + "|" + sid + "|" + id + "|" + String(ts) + "|" + u64(ctr)), sig)) return "bad_sig";
  if (!timeValid() || labs((long)time(nullptr) - ts) > 10) return "stale";
  if (ctr <= lastCtr) return "replay";
  lastCtr = ctr;
  if (op == "press") {
    prefs.putULong64("ctr", ctr);          // persistir antes de actuar (anti-replay tras reinicio)
    sessionId = sid; onAt = lastHb = millis(); relaySetOn();
  } else if (op == "hb") {
    if (!relayOn || sid != sessionId) return "no_session";
    lastHb = millis();
  } else if (op == "release") {
    if (sid == sessionId || !relayOn) relayOff();
  } else return "bad_op";
  return "ok";
}

void onWs(WStype_t type, uint8_t* payload, size_t len) {
  if (type == WStype_CONNECTED) {
    wsUp = true; backoffMs = 1000;
    String nonce = String(esp_random(), HEX) + String(esp_random(), HEX);
    long ts = time(nullptr);
    JsonDocument d; d["type"] = "hello"; d["ts"] = ts; d["nonce"] = nonce;
    d["mac"] = hmacHex("hello|" + String(ts) + "|" + nonce);
    String out; serializeJson(d, out); ws.sendTXT(out);
  } else if (type == WStype_DISCONNECTED) {
    if (wsUp) Serial.println("WS caido");
    wsUp = false; relayOff();                       // sin canal -> OFF
    ws.disconnect();                                 // reconexión manual con backoff
    nextTry = millis() + backoffMs; backoffMs = min<uint32_t>(backoffMs * 2, 60000);
  } else if (type == WStype_TEXT) {
    JsonDocument m;
    if (deserializeJson(m, payload, len)) return;
    String op = m["type"] | "";
    const char* res = handleCmd(m);
    if (op == "press" || op == "release") sendAck(m["id"] | "", m["ctr"] | (uint64_t)0, res);
  }
}

void startWs() {
  ws.beginSslWithCA(API_HOST, API_PORT, API_PATH, CA_CERT);   // CA pineada: solo tu dominio
  ws.onEvent(onWs);
  ws.setReconnectInterval(0x7FFFFFFF);  // desactiva la reconexión interna; usamos backoff propio
  ws.enableHeartbeat(30000, 5000, 2);   // ping/pong para detectar caídas
}

void setup() {
  digitalWrite(RELAY_PIN, RELAY_OFF_LEVEL);   // nivel inactivo ANTES de habilitar la salida
  pinMode(RELAY_PIN, OUTPUT);
  relayOff();
  Serial.begin(115200);

  esp_task_wdt_config_t cfg = { .timeout_ms = WDT_TIMEOUT_S * 1000, .idle_core_mask = 0, .trigger_panic = true };
  esp_task_wdt_reconfigure(&cfg);            // core 3.x; en core 2.x usar esp_task_wdt_init(WDT_TIMEOUT_S, true)
  esp_task_wdt_add(NULL);

  hexToBytes(DEVICE_SECRET_HEX, secretKey, 32);
  prefs.begin("porton", false);
  lastCtr = prefs.getULong64("ctr", 0);

  WiFi.mode(WIFI_STA); WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  configTzTime("UTC0", "pool.ntp.org", "time.google.com");
}

void loop() {
  esp_task_wdt_reset();
  uint32_t now = millis();

  // ---- dead-man y tope: SIEMPRE se evalúan primero ----
  if (relayOn && (now - lastHb > DEADMAN_MS || now - onAt > MAX_HOLD_MS)) relayOff();

  if (WiFi.status() != WL_CONNECTED) {
    if (relayOn) relayOff();
    if (wsUp) { ws.disconnect(); wsUp = false; }
    delay(50); return;
  }
  if (!timeValid()) { delay(50); return; }    // sin NTP no se aceptan comandos ni se conecta

  static bool started = false;
  if (!started && now >= nextTry) { startWs(); started = true; }
  if (started && !wsUp && now >= nextTry && nextTry != 0) { startWs(); nextTry = 0; }
  ws.loop();
  delay(5);
}
