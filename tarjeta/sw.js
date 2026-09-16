/* Premium Motion PWA bootstrap */
const MOTION_CACHE='william-card-motion-v1';
const MOTION_ASSETS=['./card-core.css','./card-core.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(MOTION_CACHE).then(cache=>cache.addAll(MOTION_ASSETS)).catch(()=>undefined))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('william-card-motion-')&&k!==MOTION_CACHE).map(k=>caches.delete(k)))))});
importScripts('./sw-core.js');
