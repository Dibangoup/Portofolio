// SERVICE WORKER - CACHE ET SUPPORT HORS-LIGNE (PWA)
const CACHE_NAME = 'jordan-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/css/tailwind-build.css',
  '/css/glass.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/layout.css',
  '/css/overlays.css',
  '/css/scrollbar.css',
  '/css/utilities.css',
  '/js/portfolio-data.js',
  '/js/icons.js',
  '/js/app.js',
  '/images/favicon.svg',
  '/images/jordan-portrait.jpg'
];

// Installation du Service Worker et mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Erreur mise en cache sélective:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie Réseau d'abord avec repli sur le cache (Network First with Cache Fallback)
self.addEventListener('fetch', (event) => {
  // On ne gère que les requêtes GET same-origin ou statiques
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return; // Éviter de cacher les requêtes API

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
