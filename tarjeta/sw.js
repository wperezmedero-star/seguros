/* Tarjeta de William Pérez-Mederos · modo sin conexión.
   Solo guarda archivos públicos de esta tarjeta. Cambie VERSION en cada publicación. */
const VERSION = 'wp-tarjeta-v3-20260916';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = [
  './', 'index.html', 'app.css', 'app.js', 'app.webmanifest', 'vendor/qrcode.min.js', 'william-perez-mederos.vcf',
  'assets/foto.webp', 'assets/foto-360.webp', 'assets/avatar-96.webp',
  'assets/fraunces-500.woff2', 'assets/inter-400.woff2', 'assets/inter-600.woff2',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/favicon-48.png'
].map(p => new URL(p, ROOT).href);

self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(VERSION);
  await c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));
  await self.skipWaiting();
})()));

self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => (k.startsWith('wp-tarjeta-') || k.startsWith('william-card-')) && k !== VERSION).map(k => caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(ROOT)) return;
  const clean = url.origin + url.pathname;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(req, { signal: ctrl.signal }); clearTimeout(t);
        if (res.ok) c.put(new URL('index.html', ROOT).href, res.clone());
        return res;
      } catch {
        return (await c.match(new URL('index.html', ROOT).href)) || new Response('Vuelva a abrir la tarjeta cuando tenga conexión.', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      }
    })());
    return;
  }

  if (ASSETS.includes(clean)) {
    e.respondWith((async () => {
      const c = await caches.open(VERSION), hit = await c.match(clean);
      const update = fetch(req).then(res => { if (res.ok && res.type === 'basic') c.put(clean, res.clone()); return res; }).catch(() => hit);
      return hit || update;
    })());
  }
});
