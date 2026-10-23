/*
  LunaCycle v1.2
  Copyright (C) 2026 I contributori di LunaCycle
  SPDX-License-Identifier: GPL-3.0-or-later

  Questo programma è software libero: puoi ridistribuirlo e/o modificarlo
  secondo i termini della GNU General Public License pubblicata dalla Free
  Software Foundation, versione 3 della Licenza o (a tua scelta) qualsiasi
  versione successiva.

  Questo programma è distribuito nella speranza che sia utile, ma SENZA
  ALCUNA GARANZIA; senza neppure la garanzia implicita di COMMERCIABILITÀ o
  IDONEITÀ PER UNO SCOPO PARTICOLARE. Vedi la GNU GPL per maggiori dettagli.
  Dovresti aver ricevuto una copia della GNU GPL insieme a questo programma
  (file LICENSE); in caso contrario vedi <https://www.gnu.org/licenses/>.
*/
const CACHE_NAME = 'lunacycle-v4';
const ASSETS_TO_CACHE = [
  './manifest.json',
  './icons/icon-192.png',
  './',
  './index.html',
  './PRIVACY.md',
  './TERMS.md'
  // Le altre icone vengono messe in cache dinamicamente
];

// Install: mette in cache gli asset di base. Un asset mancante non deve far fallire l'installazione.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(ASSETS_TO_CACHE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

// Activate: elimina le vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch: navigazioni network-first (con timeout), risorse cache-first con aggiornamento in background
self.addEventListener('fetch', event => {
  const req = event.request;
  // Solo GET della stessa origine (salta anche file:// con origin "null")
  if (req.method !== 'GET' || !self.location.origin || self.location.origin === 'null' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  const isNavigationRequest = req.mode === 'navigate';

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(req, { ignoreSearch: isNavigationRequest });

      if (cachedResponse && !isNavigationRequest) {
        event.waitUntil(
          fetch(req).then(async networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(req, networkResponse.clone());
            }
          }).catch(() => null)
        );
        return cachedResponse;
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 15000);
      try {
        const networkResponse = await fetch(req, { signal: abortController.signal });
        clearTimeout(timeoutId);

        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return cachedResponse || networkResponse;
        }

        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        clearTimeout(timeoutId);
        if (cachedResponse) return cachedResponse;
        if (isNavigationRequest) {
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
        }
        return Response.error();
      }
    })()
  );
});

// Messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
