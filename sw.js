// Service Worker untuk index.html (Tempahan Dewan DSAT - borang awam)
// Strategi "network-first": sentiasa cuba ambil versi TERKINI dari server dulu,
// cache cuma fallback bila offline. Ini elak isu "update tak nampak sebab cache basi".
//
// Bila buat perubahan pada index.html, naikkan nombor versi CACHE_NAME di bawah (v1 -> v2)
// supaya cache lama automatik dibuang semasa "activate".

const CACHE_NAME = 'dsat-index-v1';
const FAIL_UNTUK_CACHE = ['index.html'];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FAIL_UNTUK_CACHE);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(namaCache) {
      return Promise.all(
        namaCache
          .filter(function(nama) { return nama !== CACHE_NAME; })
          .map(function(nama) { return caches.delete(nama); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
