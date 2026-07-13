// Service Worker untuk menu.html (Menu Utama Sistem DSAT)
// PENTING: Guna strategi "network-first" — sentiasa cuba ambil versi TERKINI dari server dulu,
// cache cuma jadi fallback bila offline. Ini elak isu "update tak nampak sebab cache basi"
// yang pernah berlaku sebelum ini pada fail-fail lain dalam sistem DSAT.
//
// Bila buat perubahan pada menu.html/manifest, naikkan nombor versi CACHE_NAME di bawah (v1 -> v2)
// supaya cache lama automatik dibuang semasa "activate".

const CACHE_NAME = 'dsat-menu-v1';
const FAIL_UNTUK_CACHE = ['menu.html'];

self.addEventListener('install', function(event) {
  self.skipWaiting(); // terus aktifkan versi baru tanpa tunggu tab lama tutup
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
      return self.clients.claim(); // kawal tab yang dah terbuka serta-merta
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Simpan salinan terkini ke cache untuk fallback offline akan datang
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // Offline: guna cache jika ada
        return caches.match(event.request);
      })
  );
});
