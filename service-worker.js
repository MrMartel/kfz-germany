const CACHE_NAME = 'kfz-finder-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './data.json',
  './Images/apple-touch-icon.png',
  './Images/image_accueil.png',
  './Images/germany-map.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap'
];

// Installation et mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches lors d'une mise à jour
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes : priorité au cache, secours sur le réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});