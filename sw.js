const CACHE_NAME = "dashboard-cache-v1";

// List every file your app needs to run offline.
// Update this list whenever you add/rename CSS, JS, or image files.
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/CSS/style.css",
  "/CSS/media.css",
  "/images/user-200x300.webp",
  "/manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// Install: cache the core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // activate new SW immediately instead of waiting
});

// Activate: clean up old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // take control of open pages right away
});

// Fetch: cache-first, falling back to network, then caching the response
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache non-successful or opaque cross-origin responses
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional: return a fallback page here if you add one, e.g.:
          // if (event.request.mode === "navigate") return caches.match("/offline.html");
        });
    })
  );
});
