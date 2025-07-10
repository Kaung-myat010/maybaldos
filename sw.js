const CACHE_NAME = 'maybaldos'; 
const urlsToCache = [
    '/maybaldos/',
    '/maybaldos/index.html',
    '/maybaldos/icons/icon-192x192.png',
    '/maybaldos/icons/icon-512x512.png', 
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Padauk&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar&display=swap',
    
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});


 
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; 

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
       
        if (response) {
          
          return response;
        }

        
        return fetch(event.request);
      }
    )
  );
});
