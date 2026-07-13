const CACHE_NAME = "dsat-v3";

const STATIC_FILES = [
  "/dsat/",
  "/dsat/index.html",
  "/dsat/jadual.html",
  "/dsat/style.css",
  "/dsat/app.js",
  "/dsat/icon-192.png",
  "/dsat/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
  );

  self.skipWaiting();
});


self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


self.addEventListener("fetch", event => {

  const url = new URL(event.request.url);

  // menu admin jangan cache
  if (url.pathname.includes("menu.html")) {
    event.respondWith(fetch(event.request));
    return;
  }


  event.respondWith(
    fetch(event.request)
      .then(response => {

        let copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, copy);
          });

        return response;

      })
      .catch(() => {
        return caches.match(event.request);
      })
  );

});