/** Cliente del Portón: hold-to-run por WebSocket (/api/gate/app/ws).
 *  press al presionar, heartbeat cada 300 ms y release al soltar, pointercancel, blur u ocultar la pestaña. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from './apiBase';

export function gateWsUrl() {
  const base = API_URL || window.location.origin;
  return base.replace(/^http/, 'ws').replace(/\/$/, '') + '/api/gate/app/ws';
}

const HB_MS = 300;

/** auth: { key } (familiar) o { token } (admin del panel). */
export function useGateHold(auth, { onReleased } = {}) {
  const wsRef = useRef(null);
  const hbRef = useRef(0);
  const holdingRef = useRef(false);
  const [phase, setPhase] = useState('idle'); // idle | connecting | waiting | on
  const [message, setMessage] = useState('');
  const onReleasedRef = useRef(onReleased);
  onReleasedRef.current = onReleased;

  const send = (m) => { const ws = wsRef.current; if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };

  const stop = useCallback((notify = true) => {
    if (hbRef.current) { clearInterval(hbRef.current); hbRef.current = 0; }
    if (holdingRef.current && notify) send({ type: 'release' });
    holdingRef.current = false;
    setPhase((p) => (p === 'idle' ? p : 'idle'));
  }, []);

  const connect = useCallback(() => new Promise((resolve, reject) => {
    const cur = wsRef.current;
    if (cur && cur.readyState === 1 && cur.__ready) return resolve(cur);
    const ws = new WebSocket(gateWsUrl());
    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', ...auth }));
    ws.onmessage = (ev) => {
      let m = {}; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.type === 'ready') { ws.__ready = true; wsRef.current = ws; resolve(ws); }
      else if (m.type === 'on') setPhase('on');
      else if (m.type === 'denied') { setMessage(m.reason); stop(false); }
      else if (m.type === 'released') {
        setMessage(`Detenido (${m.reason}, ${m.duration}s)`); stop(false);
        onReleasedRef.current && onReleasedRef.current(m);
      }
    };
    ws.onclose = (e) => {
      if (wsRef.current === ws) wsRef.current = null;
      stop(false);
      if (e.code === 4401) setMessage('Acceso inválido, revocado o vencido');
      reject(new Error('closed'));
    };
  }), [auth, stop]);

  const start = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (holdingRef.current) return;
    holdingRef.current = true; setMessage(''); setPhase('connecting');
    try { await connect(); } catch { holdingRef.current = false; setPhase('idle'); return; }
    if (!holdingRef.current) return;      // soltó antes de conectar
    setPhase('waiting');
    send({ type: 'press' });
    hbRef.current = setInterval(() => send({ type: 'hb' }), HB_MS);
  }, [connect]);

  useEffect(() => {
    const onHide = () => { if (document.hidden) stop(); };
    const onBlur = () => stop();
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onBlur);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onBlur);
      document.removeEventListener('visibilitychange', onHide);
      stop();
      if (wsRef.current) wsRef.current.close();
    };
  }, [stop]);

  /** Props para el botón: <button {...buttonProps}> */
  const buttonProps = {
    onPointerDown: (e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} start(e); },
    onPointerUp: () => stop(),
    onPointerCancel: () => stop(),
    onLostPointerCapture: () => stop(),
    onContextMenu: (e) => e.preventDefault(),
    style: { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  };
  return { phase, message, buttonProps };
}

export function HoldButton({ hold, disabled }) {
  const { phase, buttonProps } = hold;
  const on = phase === 'on';
  const label = on ? 'ACTIVO · suelta para parar' : phase === 'idle' ? 'Mantén presionado' : 'Conectando…';
  return (
    <button
      type="button"
      disabled={disabled}
      {...buttonProps}
      data-testid="gate-hold-button"
      className={`w-52 h-52 rounded-full font-bold text-lg transition-colors select-none border-4 ${
        on ? 'bg-[#FF2A00] border-white text-white' : 'bg-[#141414] border-[#FF2A00] text-white hover:bg-[#1f1f1f]'
      } disabled:opacity-40`}
    >
      {label}
    </button>
  );
}
