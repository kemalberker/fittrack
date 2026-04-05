// FitTrack Pro - Service Worker
// Bu dosyayı her güncellemede versiyon numarasını değiştir → iPhone otomatik güncellenir
var CACHE_VERSION = 'fittrack-v3';
var CACHE_FILES = ['/'];

// Kurulum: önbelleğe al
self.addEventListener('install', function(e) {
  self.skipWaiting(); // hemen aktif ol, bekleme
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// Aktivasyon: eski önbellekleri sil
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_VERSION; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim(); // açık sekmeleri hemen kontrol et
    })
  );
});

// Fetch: önce ağdan dene, başarısız olursa önbellekten ver
self.addEventListener('fetch', function(e) {
  // Sadece GET isteklerini yakala
  if(e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Ağdan geldiyse önbelleği güncelle
      var clone = response.clone();
      caches.open(CACHE_VERSION).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      // Ağ yoksa önbellekten ver
      return caches.match(e.request);
    })
  );
});
