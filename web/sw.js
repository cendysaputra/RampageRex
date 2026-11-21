// Versi cache
const CACHE = 'rex-v2';

// Pasang
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', './index.html', './style.css', './manifest.webmanifest'])).then(() => self.skipWaiting()));
});

// Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Ambil dari cache, perbarui di latar
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request, { ignoreSearch: true });
    const fresh = fetch(request).then(response => {
      if (response.ok && response.status === 200) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
