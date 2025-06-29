const CACHE_NAME = 'voucher-app-v2'; // ဗားရှင်းကို ပြောင်းလိုက်ပါတယ်
const urlsToCache = [
    '/maybaldos/',
    '/maybaldos/index.html',
    '/maybaldos/icons/icon-192x192.png',
    '/maybaldos/icons/icon-512x512.png', 
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Padauk&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar&display=swap',
    // Font Awesome မှ အသုံးပြုသည့် font files များသည် CSS မှတစ်ဆင့် တောင်းဆိုသွားမည်ဖြစ်ပြီး၊ 
    // fetch event က ၎င်းတို့ကို အလိုအလျောက် cache လုပ်သွားပါမည်။
];

// 1. Install Event: Service Worker ကို install လုပ်ပြီး cache ကို စတင်တည်ဆောက်ခြင်း
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add files during install', err);
      })
  );
});

// 2. Activate Event: Cache အဟောင်းများကို ရှင်းလင်းခြင်း
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event: App မှတောင်းဆိုမှုများ (requests) ကို ကြားဖြတ်ဖမ်းယူခြင်း
self.addEventListener('fetch', event => {
  // Google Fonts မှ တောင်းဆိုမှုများအတွက် Network-First strategy ကိုသုံးခြင်း
  if (event.request.url.startsWith('https://fonts.googleapis.com') || event.request.url.startsWith('https://fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          });
      })
    );
    return;
  }

  // အခြားသော တောင်းဆိုမှုများအတွက် Cache-First strategy ကိုသုံးခြင်း
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache ထဲတွင် ရှာတွေ့လျှင် cache မှ response ကို ပြန်ပေးမည်
        if (response) {
          return response;
        }

        // Cache ထဲတွင်မရှိလျှင် network မှတဆင့် သွားယူမည်
        return fetch(event.request).then(
          response => {
            // response မမှန်ကန်လျှင် (e.g. 404), တိုက်ရိုက်ပြန်ပေးမည်
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // မှန်ကန်သော response ဖြစ်လျှင် ၎င်းကို cache ထဲသို့ထည့်သိမ်းပြီးမှ page ကိုပြန်ပေးမည်
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});