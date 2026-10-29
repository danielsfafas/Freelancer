// Service worker de /porton. Nunca intercepta /api (estado, WebSocket y comandos van siempre a la red).
// Solo guarda la página /porton para que abra sin red y muestre "Sin conexión".
const C = 'porton-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (e.request.mode === 'navigate' && u.pathname.startsWith('/porton')) {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(C).then((x) => x.put('/porton', c)); return r; })
      .catch(() => caches.match('/porton')));
  }
});
