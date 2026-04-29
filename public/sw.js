const CACHE_NAME = 'fitgenie-v2';
const SHELL_FILES = ['/manifest.webmanifest', '/logo.png'];
const STATIC_EXTENSIONS = /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiLikeRequest = url.pathname.startsWith('/api/') || url.pathname.includes('googleapis.com') || url.pathname.includes('firebase');
  const isStaticAsset = STATIC_EXTENSIONS.test(url.pathname) || url.pathname === '/' || url.pathname === '/manifest.webmanifest';

  if (!isSameOrigin || isApiLikeRequest || !isStaticAsset) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
