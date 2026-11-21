import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from './apiBase';

const EXCLUDED = /^\/(admin|porton)(\/|$)/i;

/** true si el visitante pidió no ser medido (DNT, GPC u opt-out de analítica en /privacidad). */
export function analyticsDisabled() {
  try {
    const nav = window.navigator || {};
    if (nav.doNotTrack === '1' || window.doNotTrack === '1' || nav.globalPrivacyControl === true) return true;
    const ph = window.posthog;
    if (ph && ph.__loaded && typeof ph.has_opted_out_capturing === 'function' && ph.has_opted_out_capturing()) return true;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('__ph_opt_in_out_') && window.localStorage.getItem(k) === '0') return true;
    }
  } catch (e) {
    /* almacenamiento bloqueado: seguimos sin datos extra */
  }
  return false;
}

function send(path) {
  if (EXCLUDED.test(path) || analyticsDisabled()) return;
  const ref = document.referrer || '';
  const body = JSON.stringify({ path, referrer: ref });
  const url = `${API_URL}/api/visits/track`;
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return;
  } catch (e) { /* fallback abajo */ }
  fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true, credentials: 'omit' }).catch(() => {});
}

/** Registra una vista anónima por cada cambio de ruta pública. */
export function VisitTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    const t = setTimeout(() => send(pathname), 400);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
