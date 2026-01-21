// sw.js — Offline-first para tu app (GitHub Pages / HTTPS)
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `bioparque-parte-diario-${CACHE_VERSION}`;

// Ajustá esta lista según los archivos reales del proyecto.
// Si usás un solo index con <style> y <script> internos, esto alcanza.
const ASSETS = [
  "./",
  "./index.html",
  "./fondo.jpg",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalación: precache de assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: Cache-first para navegación y assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Guardar en cache respuestas válidas
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // Fallback simple: si es navegación, devuelve el index
          if (req.mode === "navigate") return caches.match("./index.html");
          throw new Error("Offline and not cached");
        });
    })
  );
});
