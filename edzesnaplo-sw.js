/* Edzésnapló service worker – csak az edzesnaplo.html-t és saját fájljait kezeli (scope: /edzesnaplo.html). */
const CACHE='edzesnaplo-4852d9f629d3';
const CORE=["edzesnaplo.html", "edzesnaplo.webmanifest", "edzesnaplo-assets/apple-touch-icon.png", "edzesnaplo-assets/edzesnaplo.css", "edzesnaplo-assets/edzesnaplo.js", "edzesnaplo-assets/favicon.svg", "edzesnaplo-assets/icon-192.png", "edzesnaplo-assets/icon-32.png", "edzesnaplo-assets/icon-512.png", "edzesnaplo-assets/icon-maskable-512.png"];
const FONTS=["fonts/instrument-sans-400.woff2", "fonts/instrument-sans-400-hu.woff2", "fonts/instrument-sans-500.woff2", "fonts/instrument-sans-500-hu.woff2", "fonts/instrument-sans-600.woff2", "fonts/instrument-sans-600-hu.woff2", "fonts/instrument-sans-700.woff2", "fonts/instrument-sans-700-hu.woff2", "fonts/bricolage-grotesque-800.woff2", "fonts/bricolage-grotesque-800-hu.woff2", "fonts/jetbrains-mono-500.woff2", "fonts/jetbrains-mono-500-hu.woff2", "fonts/jetbrains-mono-700.woff2", "fonts/jetbrains-mono-700-hu.woff2"];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})));
  await Promise.allSettled(FONTS.map(u=>c.add(new Request(u,{cache:'reload'}))));  // hiányzó font ne buktassa el a telepítést
  await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k.startsWith('edzesnaplo-')&&k!==CACHE)await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('edzesnaplo.html'):null);
    return hit||fetch(r);
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil((async()=>{
    const all=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all)if(new URL(c.url).pathname.endsWith('/edzesnaplo.html')&&'focus' in c)return c.focus();
    if(self.clients.openWindow)return self.clients.openWindow('edzesnaplo.html');
  })());
});
