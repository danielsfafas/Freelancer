/** PWA móvil para familiares: /porton. Llave personal guardada en IndexedDB (no usa el login del panel). */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../lib/apiBase';
import { useGateHold, HoldButton } from '../lib/gateClient';

function idb(mode, fn) {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('porton', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => reject(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction('kv', mode); const q = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(q && q.result); tx.onerror = () => reject(tx.error);
    };
  });
}
const getKey = () => idb('readonly', (s) => s.get('key'));
const setKey = (k) => idb('readwrite', (s) => s.put(k, 'key'));
const delKey = () => idb('readwrite', (s) => s.delete('key'));

function Control({ gateKey, onForget }) {
  const auth = useMemo(() => ({ key: gateKey }), [gateKey]);
  const [st, setSt] = useState(null);
  const [err, setErr] = useState('');
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/gate/status`, { headers: { 'X-Gate-Key': gateKey }, cache: 'no-store' });
      if (r.status === 403) { setErr('Llave inválida, revocada o vencida'); return; }
      setSt(await r.json()); setErr('');
    } catch { setErr('Sin conexión con el servidor'); }
  }, [gateKey]);
  useEffect(() => { refresh(); const t = setInterval(refresh, 15000); return () => clearInterval(t); }, [refresh]);
  const hold = useGateHold(auth, { onReleased: refresh });
  return (
    <>
      <p className={`text-sm ${st?.device_online ? 'text-green-500' : 'text-red-500'}`}>
        {err || (st ? (st.device_online ? '● Dispositivo conectado' : '● Dispositivo desconectado') : 'Consultando…')}
      </p>
      <HoldButton hold={hold} disabled={!st?.device_online} />
      <p className="text-sm min-h-[1.25rem]" role="status">{hold.message}</p>
      {st?.last_open && (
        <p className="text-xs text-[#A3A3A3]">Última: {new Date(st.last_open.ts).toLocaleString('es-MX')} · {st.last_open.user}</p>
      )}
      <button className="text-xs text-[#A3A3A3] underline mt-6" onClick={onForget}>Olvidar llave</button>
    </>
  );
}

export default function PortonPage() {
  const [gateKey, setGateKey] = useState(undefined);
  const [input, setInput] = useState('');

  useEffect(() => {
    document.title = 'Portón';
    const link = document.createElement('link');
    link.rel = 'manifest'; link.href = '/porton.webmanifest';
    document.head.appendChild(link);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/porton-sw.js', { scope: '/porton' }).catch(() => {});
    getKey().then((k) => setGateKey(k || null)).catch(() => setGateKey(null));
    return () => link.remove();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const k = input.trim();
    if (!k.startsWith('prt_')) { alert('Llave no válida'); return; }
    await setKey(k); setInput(''); setGateKey(k);
  };
  const forget = async () => { if (window.confirm('¿Borrar la llave de este teléfono?')) { await delKey(); setGateKey(null); } };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center gap-5 p-6 text-center" data-testid="porton-page">
      <h1 className="text-2xl font-bold">Portón</h1>
      {gateKey === undefined ? null : gateKey ? (
        <Control gateKey={gateKey} onForget={forget} />
      ) : (
        <form onSubmit={save} className="w-full max-w-sm space-y-3">
          <p className="text-sm text-[#A3A3A3]">Pega tu llave personal (solo se pide una vez):</p>
          <input type="password" autoComplete="off" spellCheck={false} value={input} onChange={(e) => setInput(e.target.value)}
                 className="w-full p-3 bg-[#141414] border border-[#262626] text-white" />
          <button type="submit" className="w-full p-3 bg-[#FF2A00] font-semibold">Guardar</button>
        </form>
      )}
    </main>
  );
}
