// Service Worker для Tez Jumush PWA
const CACHE_NAME = 'tez-jumush-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints для кэширования
const API_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/tasks/,
  /\/api\/users/
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Обработка API запросов
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // Обработка статических ресурсов
  if (request.method === 'GET') {
    event.respondWith(
      handleStaticRequest(request)
    );
  }
});

// Обработка API запросов с кэшированием
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Пытаемся получить данные из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшируем успешные ответы
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache:', error);
    
    // Если сеть недоступна, пытаемся получить из кэша
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем fallback ответ
    return new Response(
      JSON.stringify({ 
        error: 'Офлайн режим', 
        message: 'Нет подключения к интернету' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Обработка статических запросов
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Пытаемся получить из кэша
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Если нет в кэше, загружаем из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static request failed:', error);
    
    // Возвращаем offline страницу для навигационных запросов
    if (request.mode === 'navigate') {
      return cache.match('/offline.html') || 
             new Response('Офлайн режим', { status: 503 });
    }
    
    throw error;
  }
}

// Обработка push уведомлений
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'У вас есть новая задача!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Посмотреть',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Tez Jumush', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // Открываем приложение
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    return;
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Здесь можно добавить логику синхронизации данных
    console.log('Performing background sync...');
    
    // Например, отправка отложенных запросов
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.method === 'POST' || request.method === 'PUT') {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('Synced request:', request.url);
        } catch (error) {
          console.log('Failed to sync request:', request.url, error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Обработка сообщений от основного потока
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
