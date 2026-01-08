const CACHE_NAME = 'senkou-v1';
const STATIC_CACHE = 'senkou-static-v1';
const API_CACHE = 'anilist-api-cache';
const IMAGE_CACHE = 'anilist-images-cache';

const STATIC_ASSETS = [
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/senkou-circle-logo.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('senkou-') && name !== CACHE_NAME && name !== STATIC_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === 'https://graphql.anilist.co') {
    event.respondWith(networkFirst(request, API_CACHE, 60 * 60));
    return;
  }

  if (url.origin === 'https://s4.anilist.co') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 60 * 60 * 24 * 30));
    return;
  }

  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 60 * 60 * 24 * 7));
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 60 * 60 * 24 * 7));
    return;
  }
});

async function networkFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());

      const body = await clonedResponse.blob();
      const cachedResponse = new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers,
      });

      cache.put(request, cachedResponse);
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      const timestamp = cachedResponse.headers.get('sw-cache-timestamp');
      if (timestamp) {
        const age = (Date.now() - parseInt(timestamp, 10)) / 1000;
        if (age < maxAgeSeconds) {
          return cachedResponse;
        }
      }
      return cachedResponse;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const timestamp = cachedResponse.headers.get('sw-cache-timestamp');
    if (timestamp) {
      const age = (Date.now() - parseInt(timestamp, 10)) / 1000;
      if (age < maxAgeSeconds) {
        return cachedResponse;
      }
    } else {
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());

      const body = await clonedResponse.blob();
      const cachedResponseToStore = new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers,
      });

      cache.put(request, cachedResponseToStore);
    }
    return response;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
