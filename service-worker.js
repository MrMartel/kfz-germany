const CACHE_NAME = 'kfz-finder-v7.3.1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './data.json',
  './manifest.json',
  './Images/apple-touch-icon.png',
  './Images/image_accueil.png',
  './Images/germany-map.svg',
  './Images/plaque_allemande_vierge_blanc.png',
  './Images/macaron_CT.png',
  './Images/Armoiries_Landers/amr_bw.svg',
  './Images/Armoiries_Landers/amr_by.svg',
  './Images/Armoiries_Landers/amr_be.svg',
  './Images/Armoiries_Landers/amr_bb.svg',
  './Images/Armoiries_Landers/amr_hb.svg',
  './Images/Armoiries_Landers/amr_hh.svg',
  './Images/Armoiries_Landers/amr_he.svg',
  './Images/Armoiries_Landers/amr_mv.svg',
  './Images/Armoiries_Landers/amr_ni.svg',
  './Images/Armoiries_Landers/amr_nrw.svg',
  './Images/Armoiries_Landers/amr_rlp.svg',
  './Images/Armoiries_Landers/amr_sl.svg',
  './Images/Armoiries_Landers/amr_sn.svg',
  './Images/Armoiries_Landers/amr_st.svg',
  './Images/Armoiries_Landers/amr_sh.svg',
  './Images/Armoiries_Landers/amr_th.svg',
  'https://upload.wikimedia.org/wikipedia/commons/d/da/Coat_of_arms_of_Germany.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

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

// Écoute de la commande de mise à jour forcée envoyée par l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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