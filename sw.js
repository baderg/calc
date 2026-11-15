const V='annu-calc-v7';const FILES=['./','index.html','style.css','app.js','quote.js','engine.js','mort.js','manifest.json','logo.svg','lib/jspdf.umd.min.js','lib/jspdf.plugin.autotable.min.js','lib/fonts.js','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
