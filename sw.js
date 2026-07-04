const CACHE_NAME = "dsat-v2";
const urlsToCache = [
  "/dsat/index.html",
  "/dsat/jadual.html",
  "/dsat/admin.html",
  "/dsat/icon-192.png",
  "/dsat/icon-512.png"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  // Bypass POST requests
  if (e.request.method !== "GET") return;

  // Bypass Apps Script requests
  if (e.request.url.includes("script.google.com")) return;

  // Bypass external CDN
  if (e.request.url.includes("cdn.jsdelivr.net")) return;
  if (e.request.url.includes("cdnjs.cloudflare.com")) return;

  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
