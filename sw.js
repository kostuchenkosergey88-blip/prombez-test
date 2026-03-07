const CACHE_NAME = 'prombez-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'questions_b211.json',
  'questions_b26.json',
  'icons/icon-152x152.png',
  'icons/icon-167x167.png',
  'icons/icon-180x180.png',
  'icons/icon-512x512.png',
  'icons/splash.png'
];

// Установка Service Worker и кеширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кеш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов и возврат из кеша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если есть в кеше - возвращаем, иначе грузим из сети
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Очистка старого кеша при обновлении
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});