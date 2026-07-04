const CACHE_NAME = "dsat-admin-v2";
const urlsToCache = [
  "/dsat/admin.html",
  "/dsat/kewangan.html",
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
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("script.google.com")) return;
  if (e.request.url.includes("cdn.jsdelivr.net")) return;
  if (e.request.url.includes("cdnjs.cloudflare.com")) return;

  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
