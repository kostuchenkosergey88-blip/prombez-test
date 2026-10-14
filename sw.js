// Версия кеша: при смене старый кеш удаляется
const CACHE_NAME = 'prombez-v4';

const PRECACHE = [
  'index.html',
  'style.css',
  'manifest.json',
  'tests-config.js',
  'questions_a1.json',
  'questions_b21.json',
  'questions_b23.json',
  'questions_b26.json',
  'questions_b27.json',
  'questions_b28.json',
  'questions_b211.json',
  'questions_electro3.json',
  'questions_electro4.json',
  'icons/icon-152x152.png',
  'icons/icon-167x167.png',
  'icons/icon-180x180.png',
  'icons/icon-512x512.png'
];

const OFFLINE_PAGE = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Нет подключения</title></head>
<body style="font-family:system-ui,sans-serif;padding:48px 16px;text-align:center;color:#1a1c2b;background:#f6f7f9;">
<h1 style="font-size:20px;font-weight:600;">Нет подключения</h1>
<p style="color:#4d5366;">Проверьте интернет и обновите страницу.</p></body></html>`;

// Ключ кеша без параметров (?t=...), чтобы вопросы находились офлайн
function cacheKey(request) {
  const url = new URL(request.url);
  url.search = '';
  return url.toString();
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Сначала сеть (всегда свежая версия), при отсутствии сети — кеш
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(cacheKey(request), copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(cacheKey(request));
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const index = await caches.match(new URL('index.html', self.registration.scope).toString());
          if (index) return index;
          return new Response(OFFLINE_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        return Response.error();
      })
  );
});
