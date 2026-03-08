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


function adjustTestSelectorHeight() {
    const btn = document.querySelector('.test-selector-btn');
    const textSpan = btn ? btn.querySelector('span:first-child') : null;
    
    if (btn && textSpan) {
        // Проверяем, нужно ли увеличить высоту
        if (window.innerWidth <= 480) {
            // На маленьких экранах высота уже настроена через CSS
            return;
        }
        
        // Проверяем, помещается ли текст в одну строку
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-size: ${window.getComputedStyle(textSpan).fontSize};
            font-family: ${window.getComputedStyle(textSpan).fontFamily};
        `;
        tempSpan.innerText = textSpan.innerText;
        document.body.appendChild(tempSpan);
        
        const textWidth = tempSpan.offsetWidth;
        const containerWidth = btn.offsetWidth - 40; // минус место для стрелки
        
        if (textWidth > containerWidth) {
            // Текст не помещается, оставляем высоту для двух строк
            btn.style.minHeight = '55px';
        } else {
            // Текст помещается, можно уменьшить высоту
            btn.style.minHeight = '44px';
        }
        
        document.body.removeChild(tempSpan);
    }
}

// Вызываем при загрузке и изменении размера окна
window.addEventListener('load', adjustTestSelectorHeight);
window.addEventListener('resize', adjustTestSelectorHeight);

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

