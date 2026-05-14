// CACHE
const CACHE_NAME = "soundinsee-v1";
// ARCHIVOS A GUARDAR
const archivosCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json"
];
// INSTALACION
self.addEventListener("install", (event) => {
  console.log(
    "✅ Service Worker instalado"
  );
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(
          "📦 Archivos cacheados"
        );
        return cache.addAll(
          archivosCache
        );
      })
  );
  self.skipWaiting();
});

// ACTIVACION

self.addEventListener("activate", (event) => {
  console.log(
    "🚀 Service Worker activado"
  );
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log(
                "🗑️ Cache vieja eliminada:",
                key
              );
              return caches.delete(key);
            }
          })
        );
      })
  );
  self.clients.claim();
});

// FETCH

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((respuesta) => {
        // SI EXISTE EN CACHE
        if (respuesta) {
          return respuesta;
        }
        // SI NO EXISTE
        return fetch(event.request)
          .then((networkResponse) => {
            // Evitar errores
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== "basic"
            ) {
              return networkResponse;
            }
            // Clonar respuesta
            const responseToCache =
              networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(
                  event.request,
                  responseToCache
                );
              });
            return networkResponse;
          });
      })
      .catch(() => {
        console.log(
          "⚠️ Sin conexión"
        );
      })
  );
});
