const CACHE = 'arundeepto-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './html2canvas.min.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  // Firebase calls never cache
  if(e.request.url.includes('firestore.googleapis.com') ||
     e.request.url.includes('firebase') ||
     e.request.url.includes('gstatic')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r || fetch(e.request).then(res=>{
      return caches.open(CACHE).then(c=>{
        if(e.request.method==='GET' && res.status===200) c.put(e.request, res.clone());
        return res;
      });
    }).catch(()=>caches.match('./index.html')))
  );
});