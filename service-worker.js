const CACHE_NAME = 'kfz-finder-v4.1';

// Fichiers de base de l'application
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './data.json',
  './manifest.json',
  './Images/apple-touch-icon.png',
  './Images/image_accueil.png',
  './Images/germany-map.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap'
];

// Installation et mise en cache initiale des ressources clés
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches lors de la mise à jour de version
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

// Interception des requêtes avec mise en cache dynamique (Cache First, Network Fallback + Cache Save)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        // Si la requête est valide, on met la réponse en cache (ex: images de modale chargées à la volée)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});