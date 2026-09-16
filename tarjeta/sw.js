/* Premium Motion PWA bootstrap */
const MOTION_CACHE='william-card-motion-v1';
const MOTION_PATHS=['card-core.css','card-core.js'];
const MOTION_ASSETS=MOTION_PATHS.map(path=>new URL(path,self.location.href).href);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(MOTION_CACHE).then(cache=>cache.addAll(MOTION_ASSETS.map(url=>new Request(url,{cache:'reload'})))).catch(()=>undefined));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('william-card-motion-')&&k!==MOTION_CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(!MOTION_ASSETS.includes(url.origin+url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(MOTION_CACHE);
    const hit=await cache.match(url.origin+url.pathname);
    if(hit)return hit;
    const response=await fetch(event.request);
    if(response.ok&&response.type==='basic')await cache.put(url.origin+url.pathname,response.clone());
    return response;
  })());
});
importScripts('./sw-core.js');
