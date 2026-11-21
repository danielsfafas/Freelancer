import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Eye, Users, CalendarDays, CalendarRange, Infinity as InfinityIcon, Globe, FileText, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { API_URL } from '../lib/apiBase';

const NAVY = '#0B1B3A';
const BLUE = '#2F6BFF';
const SKY = '#7FB2FF';
const SILVER = '#C9D1DC';

const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (reduceMotion) { setVal(target); return undefined; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(a + (target - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

const fmt = (n) => new Intl.NumberFormat('es-MX').format(n || 0);
const fmtDay = (d) => {
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, m - 1, dd).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

function Kpi({ icon: Icon, label, value, sub, delay, accent }) {
  const v = useCountUp(value);
  return (
    <div className="vz-card vz-rise group relative overflow-hidden p-5" style={{ animationDelay: `${delay}ms` }} data-testid={`visits-kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="vz-glow" style={{ background: `radial-gradient(120px 80px at 85% 0%, ${accent}33, transparent 70%)` }} />
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em]" style={{ color: SILVER }}>{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </span>
      </div>
      <div className="mt-4 text-3xl font-bold tabular-nums text-white sm:text-4xl">{fmt(v)}</div>
      {sub && <div className="mt-1 text-xs text-[#8A94A6]">{sub}</div>}
    </div>
  );
}

function BarList({ title, icon: Icon, rows, empty, delay, labelFor }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="vz-card vz-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: SKY }} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[#8A94A6]">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={r.name + i} className="relative">
              <div className="vz-bar absolute inset-y-0 left-0 rounded-md"
                style={{ width: `${(r.views / max) * 100}%`, animationDelay: `${delay + 150 + i * 70}ms`, background: `linear-gradient(90deg, ${BLUE}55, ${SKY}22)` }} />
              <div className="relative flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate text-[#E6EAF0]" title={r.name}>{labelFor ? labelFor(r.name) : r.name}</span>
                <span className="tabular-nums text-[#C9D1DC]">{fmt(r.views)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DEVICE_META = {
  desktop: { label: 'Escritorio', icon: Monitor, color: BLUE },
  mobile: { label: 'Móvil', icon: Smartphone, color: SKY },
  tablet: { label: 'Tablet', icon: Tablet, color: SILVER },
};

function Devices({ rows, delay }) {
  const total = rows.reduce((s, r) => s + r.views, 0) || 1;
  const [ready, setReady] = useState(reduceMotion);
  useEffect(() => { const t = setTimeout(() => setReady(true), delay + 200); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="vz-card vz-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-4 flex items-center gap-2">
        <Monitor className="h-4 w-4" style={{ color: SKY }} />
        <h3 className="text-sm font-semibold text-white">Dispositivos</h3>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
        {['desktop', 'mobile', 'tablet'].map((k) => {
          const r = rows.find((x) => x.name === k);
          const pct = r ? (r.views / total) * 100 : 0;
          return <div key={k} style={{ width: ready ? `${pct}%` : '0%', background: DEVICE_META[k].color, transition: 'width 1.1s cubic-bezier(.2,.8,.2,1)' }} />;
        })}
      </div>
      <ul className="mt-5 space-y-3">
        {['desktop', 'mobile', 'tablet'].map((k) => {
          const r = rows.find((x) => x.name === k);
          const M = DEVICE_META[k];
          const pct = r ? Math.round((r.views / total) * 100) : 0;
          return (
            <li key={k} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[#E6EAF0]"><M.icon className="h-4 w-4" style={{ color: M.color }} />{M.label}</span>
              <span className="tabular-nums text-[#C9D1DC]">{pct}% · {fmt(r?.views || 0)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0E1830]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="mb-1 font-medium text-white">{fmtDay(label)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[#C9D1DC]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey === 'views' ? 'Visitas' : 'Visitantes'}: <b className="text-white">{fmt(p.value)}</b>
        </div>
      ))}
    </div>
  );
}

export default function AdminVisits() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/visits/stats`, { params: { days }, headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true })
      .then((r) => { if (alive) { setData(r.data); setError(''); } })
      .catch((e) => { if (alive) setError(e?.response?.status === 401 ? 'Sesión expirada. Vuelve a iniciar sesión.' : 'No se pudieron cargar las estadísticas.'); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [days, nonce]);

  const series = data?.series || [];
  const rangeTotal = useMemo(() => series.reduce((s, r) => s + r.views, 0), [series]);
  const referrers = useMemo(() => {
    if (!data) return [];
    const rows = [...data.top_referrers];
    if (data.direct) rows.push({ name: '(directo / sin referencia)', views: data.direct });
    return rows.sort((a, b) => b.views - a.views).slice(0, 8);
  }, [data]);

  return (
    <div className="vz-root space-y-6" data-testid="admin-visits">
      <style>{`
        .vz-root{--navy:${NAVY}}
        .vz-card{background:linear-gradient(160deg,rgba(20,34,66,.75),rgba(12,18,32,.9));border:1px solid rgba(201,209,220,.10);border-radius:14px;box-shadow:0 10px 30px -15px rgba(0,0,0,.6);transition:transform .35s cubic-bezier(.2,.8,.2,1),border-color .35s}
        .vz-card:hover{transform:translateY(-3px);border-color:rgba(127,178,255,.35)}
        .vz-glow{position:absolute;inset:0;pointer-events:none}
        @keyframes vzRise{from{opacity:0;transform:translateY(18px) scale(.98);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
        .vz-rise{opacity:0;animation:vzRise .7s cubic-bezier(.2,.8,.2,1) forwards}
        @keyframes vzBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .vz-bar{transform-origin:left;transform:scaleX(0);animation:vzBar .9s cubic-bezier(.2,.8,.2,1) forwards}
        @keyframes vzShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .vz-title{background:linear-gradient(90deg,#fff 0%,${SILVER} 40%,${SKY} 50%,${SILVER} 60%,#fff 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vzShine 6s linear infinite}
        @keyframes vzPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        .vz-live{animation:vzPulse 1.8s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){.vz-rise,.vz-bar,.vz-title,.vz-live{animation:none!important;opacity:1;transform:none;filter:none}}
      `}</style>

      <div className="vz-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8A94A6]">
            <span className="vz-live h-2 w-2 rounded-full" style={{ background: SKY }} /> Analítica propia · anónima
          </div>
          <h1 className="vz-title text-2xl font-bold sm:text-3xl">Visitas al portal</h1>
          <p className="mt-1 text-sm text-[#8A94A6]">
            {data?.since ? `Registrando desde el ${fmtDay(data.since)}.` : 'Aún no hay visitas registradas.'} Sin IP ni cookies; respeta “No rastrear”.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Rango">
            {[7, 30, 90].map((d) => (
              <button key={d} type="button" role="tab" aria-selected={days === d} onClick={() => setDays(d)}
                className={`relative z-10 min-h-[36px] rounded-lg px-3 text-sm font-medium transition-colors duration-300 ${days === d ? 'text-white' : 'text-[#8A94A6] hover:text-white'}`}
                style={days === d ? { background: `linear-gradient(135deg, ${BLUE}, #1C3F9E)`, boxShadow: `0 6px 18px -6px ${BLUE}` } : undefined}
                data-testid={`visits-range-${d}`}>
                {d} días
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setNonce((n) => n + 1)} aria-label="Actualizar"
            className="flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-white/10 text-[#C9D1DC] hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Kpi icon={Eye} label="Hoy" value={data?.today.views || 0} sub={`${fmt(data?.today.visitors)} visitantes`} delay={80} accent={SKY} />
        <Kpi icon={CalendarDays} label="7 días" value={data?.last7.views || 0} sub={`${fmt(data?.last7.visitors)} visitantes`} delay={160} accent={BLUE} />
        <Kpi icon={CalendarRange} label="30 días" value={data?.last30.views || 0} sub={`${fmt(data?.last30.visitors)} visitantes`} delay={240} accent={BLUE} />
        <Kpi icon={InfinityIcon} label="Total" value={data?.total.views || 0} sub="desde el inicio" delay={320} accent={SILVER} />
        <div className="col-span-2 lg:col-span-1">
          <Kpi icon={Users} label="Únicos aprox" value={data?.total.visitors || 0} sub="visitantes únicos por día, sumados" delay={400} accent={SKY} />
        </div>
      </div>

      <div className="vz-card vz-rise p-4 sm:p-6" style={{ animationDelay: '480ms' }}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">Visitas diarias · últimos {days} días</h3>
          <div className="flex items-center gap-4 text-xs text-[#C9D1DC]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: SKY }} />Visitas ({fmt(rangeTotal)})</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: SILVER }} />Visitantes</span>
          </div>
        </div>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={`${days}-${nonce}-${series.length}`} data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="vzViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vzVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SILVER} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SILVER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(201,209,220,0.07)" vertical={false} />
              <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fill: '#8A94A6', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis allowDecimals={false} tick={{ fill: '#8A94A6', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: SKY, strokeOpacity: 0.3 }} />
              <Area type="monotone" dataKey="visitors" stroke={SILVER} strokeWidth={1.5} fill="url(#vzVisitors)" isAnimationActive={!reduceMotion} animationDuration={1400} animationBegin={500} />
              <Area type="monotone" dataKey="views" stroke={SKY} strokeWidth={2.5} fill="url(#vzViews)" isAnimationActive={!reduceMotion} animationDuration={1600} animationBegin={300} activeDot={{ r: 5, fill: SKY, stroke: NAVY, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BarList title="Páginas más vistas" icon={FileText} rows={data?.top_pages || []} empty="Sin datos en este rango." delay={600} />
        <BarList title="De dónde llegan" icon={Globe} rows={referrers} empty="Sin datos en este rango." delay={700} />
        <Devices rows={data?.devices || []} delay={800} />
      </div>
    </div>
  );
}
