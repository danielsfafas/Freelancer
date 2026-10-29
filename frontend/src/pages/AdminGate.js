import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { DoorOpen, Wifi, WifiOff, UserPlus, Ban, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { API_URL } from '../lib/apiBase';
import { useGateHold, HoldButton } from '../lib/gateClient';

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }) : '—');

export default function AdminGate() {
  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const auth = useMemo(() => ({ token }), [token]);
  const [status, setStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [log, setLog] = useState([]);
  const [name, setName] = useState('');
  const [expires, setExpires] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, u, l] = await Promise.all([
        axios.get(`${API_URL}/api/gate/status`, { headers }),
        axios.get(`${API_URL}/api/gate/users`, { headers }),
        axios.get(`${API_URL}/api/gate/log?limit=100`, { headers }),
      ]);
      setStatus(s.data); setUsers(u.data || []); setLog(l.data || []);
    } catch (e) {
      if (e.response?.status === 403) setForbidden(true);
    }
  }, [headers]);

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);
  const hold = useGateHold(auth, { onReleased: load });

  const createUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const body = { name: name.trim(), expires_at: expires ? new Date(expires).toISOString() : null };
      const r = await axios.post(`${API_URL}/api/gate/users`, body, { headers });
      setNewKey({ name: r.data.name, key: r.data.key });
      setName(''); setExpires(''); load();
    } catch (err) { toast.error(err.response?.data?.detail || 'No se pudo crear'); }
  };

  const revoke = async (u) => {
    if (!window.confirm(`¿Revocar el acceso de ${u.name}?`)) return;
    try { await axios.post(`${API_URL}/api/gate/users/${u.id}/revoke`, {}, { headers }); toast.success('Acceso revocado'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Error'); }
  };

  if (forbidden) return <p className="text-[#A3A3A3]">Solo los administradores pueden usar el módulo Portón.</p>;

  const active = (u) => !u.revoked_at && !(u.expires_at && new Date(u.expires_at) <= new Date());
  return (
    <div className="space-y-8" data-testid="admin-gate">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><DoorOpen className="w-6 h-6 text-[#FF2A00]" /> Portón</h1>
        <p className="text-[#A3A3A3] text-sm">El relé permanece activo solo mientras mantienes presionado (máx. {status?.max_hold_s ?? 30} s).</p>
      </div>

      <section className="bg-[#141414] border border-[#262626] p-6 flex flex-col items-center gap-4">
        {!status?.configured && <p className="text-yellow-500 text-sm">GATE_DEVICE_SECRET no está configurado en el servidor.</p>}
        <p className={`flex items-center gap-2 text-sm ${status?.device_online ? 'text-green-500' : 'text-red-500'}`}>
          {status?.device_online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {status?.device_online ? 'Dispositivo conectado' : 'Dispositivo desconectado'}
        </p>
        <HoldButton hold={hold} disabled={!status?.device_online} />
        <p className="text-sm min-h-[1.25rem]" role="status">{hold.message}</p>
        <p className="text-xs text-[#A3A3A3]">
          Última apertura: {status?.last_open ? `${fmt(status.last_open.ts)} · ${status.last_open.user} · ${status.last_open.duration ?? '?'} s` : '—'}
        </p>
      </section>

      <section className="bg-[#141414] border border-[#262626] p-6 space-y-4">
        <h2 className="font-semibold">Personas con acceso</h2>
        <form onSubmit={createUser} className="flex flex-col md:flex-row gap-3">
          <Input placeholder="Nombre (ej. Mamá)" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          <Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} title="Vencimiento (opcional)" />
          <Button type="submit" className="bg-[#FF2A00] hover:bg-[#cc2200]"><UserPlus className="w-4 h-4 mr-2" />Crear llave</Button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[#A3A3A3] text-left"><tr><th className="py-2">Nombre</th><th>Creada</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#262626]">
                  <td className="py-2">{u.name}</td><td>{fmt(u.created_at)}</td><td>{fmt(u.expires_at)}</td>
                  <td className={active(u) ? 'text-green-500' : 'text-[#A3A3A3]'}>{u.revoked_at ? 'Revocada' : active(u) ? 'Activa' : 'Vencida'}</td>
                  <td className="text-right">{!u.revoked_at && <Button variant="ghost" size="sm" onClick={() => revoke(u)}><Ban className="w-4 h-4 mr-1" />Revocar</Button>}</td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={5} className="py-4 text-[#A3A3A3]">Sin usuarios todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[#141414] border border-[#262626] p-6 space-y-4">
        <h2 className="font-semibold">Bitácora</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[#A3A3A3] text-left"><tr><th className="py-2">Inicio</th><th>Quién</th><th>IP</th><th>Resultado</th><th>Duración</th><th>Fin</th><th>Ack</th></tr></thead>
            <tbody>
              {log.map((r) => (
                <tr key={r.id} className="border-t border-[#262626]">
                  <td className="py-1.5 whitespace-nowrap">{fmt(r.ts)}</td><td>{r.user || '—'}</td><td>{r.ip}</td>
                  <td className={r.result === 'ok' ? 'text-green-500' : 'text-red-400'}>{r.result}</td>
                  <td>{r.duration != null ? `${r.duration} s` : '—'}</td><td>{r.end_reason || '—'}</td><td className="text-[#A3A3A3]">{r.ack || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={!!newKey} onOpenChange={(o) => !o && setNewKey(null)}>
        <DialogContent className="bg-[#141414] border-[#262626]">
          <DialogHeader><DialogTitle>Llave de {newKey?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-[#A3A3A3]">Se muestra <b>una sola vez</b>. Compártela por un canal privado. La persona abre <code>{window.location.origin}/porton</code> y la pega.</p>
          <code className="block break-all bg-black p-3 text-xs select-all">{newKey?.key}</code>
          <Button onClick={() => { navigator.clipboard?.writeText(newKey.key); toast.success('Copiada'); }}><Copy className="w-4 h-4 mr-2" />Copiar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
