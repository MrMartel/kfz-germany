const CACHE_NAME = 'kfz-finder-v4.2';

// Liste complète et explicite de toutes les ressources à précharger à l'installation
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './data.json',
  './manifest.json',
  './Images/apple-touch-icon.png',
  './Images/image_accueil.png',
  './Images/germany-map.svg',
  './Images/bundesadler.png',
  './Images/baden-wurttemberg.png',
  './Images/bayern.png',
  './Images/berlin.png',
  './Images/brandenburg.png',
  './Images/bremen.png',
  './Images/hamburg.png',
  './Images/hessen.png',
  './Images/mecklenburg-vorpommern.png',
  './Images/niedersachsen.png',
  './Images/nordrhein-westfalen.png',
  './Images/rheinland-pfalz.png',
  './Images/saarland.png',
  './Images/sachsen.png',
  './Images/sachsen-anhalt.png',
  './Images/schleswig-holstein.png',
  './Images/thuringen.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap'
];

// 1. Installation : Téléchargement complet et immédiat de TOUTES les ressources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation : Suppression des anciens caches
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

// 3. Interception des requêtes : Servir depuis le cache d'abord
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
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