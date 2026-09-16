// Only public assets belonging to this card are cached. No forms, messages or external requests.
const PREFIX='wp-tarjeta-';
const CACHE=PREFIX+'v2-premium-20260916-4';
const ROOT=new URL('./',self.location.href).href;
const INDEX=new URL('index.html',ROOT).href;
const ASSETS=['index.html','card.css','card.js','app.webmanifest','vendor/qrcode.min.js','icono.png','assets/foto.webp','assets/foto-360.webp','assets/vida.webp','assets/salud.webp','assets/medicare.webp','assets/accidente.webp','assets/anualidad.webp','assets/icon-192.png','assets/icon-512.png','assets/inter-400.woff2','assets/inter-600.woff2','assets/fraunces-500.woff2'].map(path=>new URL(path,ROOT).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith(PREFIX)&&n!==CACHE).map(n=>caches.delete(n)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const clean=url.origin+url.pathname;
 if(request.mode==='navigate'&&(clean===ROOT||clean===INDEX)){
  event.respondWith((async()=>{const cache=await caches.open(CACHE),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
   try{const response=await fetch(request,{signal:controller.signal});if(response.ok&&(response.headers.get('content-type')||'').includes('text/html')){await cache.put(INDEX,response.clone());return response;}throw new Error('Navigation unavailable');}
   catch{return await cache.match(INDEX)||new Response('Vuelva a abrir la tarjeta cuando tenga conexión.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
   finally{clearTimeout(timer);}
  })());return;
 }
 if(!url.search&&ASSETS.includes(clean))event.respondWith((async()=>{const cache=await caches.open(CACHE),hit=await cache.match(clean);if(hit)return hit;const response=await fetch(request);if(response.ok&&response.type==='basic')await cache.put(clean,response.clone());return response;})());
});