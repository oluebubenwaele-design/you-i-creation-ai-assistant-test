const CACHE='you-and-i-app-v4';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);
  if(u.origin===self.location.origin && u.pathname.startsWith('/api/')) return;
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
