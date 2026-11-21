// Versi cache
const CACHE = 'rex-v3';
// Kode selalu baru
const CODE = /(\/|\.html|\.js|\.mjs|\.css|\.json|\.webmanifest)$/;

// Pasang
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', './index.html', './style.css', './manifest.webmanifest'])).then(() => self.skipWaiting()));
});

// Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Ambil permintaan
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    // Kode dari server dulu
    if (request.mode === 'navigate' || CODE.test(url.pathname)) {
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response.ok && response.status === 200) cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request, { ignoreSearch: true })) || Response.error();
      }
    }
    // Gambar dari cache, diperbarui di latar
    const cached = await cache.match(request, { ignoreSearch: true });
    const fresh = fetch(request).then(response => {
      if (response.ok && response.status === 200) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
