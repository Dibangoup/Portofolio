// SERVICE WORKER - CACHE ET SUPPORT HORS-LIGNE (PWA)
const CACHE_NAME = 'jordan-portfolio-v5-jordanos';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/tokens.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/os.css',
  '/css/print.css',
  '/css/fonts/bricolage-grotesque-var.woff2',
  '/css/fonts/geist-var.woff2',
  '/css/fonts/geist-mono-var.woff2',
  '/css/fonts/jetbrains-mono-var.woff2',
  '/js/theme-init.js',
  '/js/portfolio-data.js',
  '/js/icons.js',
  '/js/app.js',
  '/js/os.js',
  '/images/favicon.svg',
  '/images/jordan-portrait.jpg',
  '/images/tracabilite-agricole.png',
  '/images/portfolio-preview.png',
  '/images/gestion-taches.png',
  '/images/ecom.png'
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
  if (event.request.url.includes('/dashboard.html')) return; // Ne jamais intercepter le dashboard admin

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
