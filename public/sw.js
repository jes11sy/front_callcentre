// Service Worker для Push-уведомлений
// Этот файл статичный и копируется в public при билде

const CACHE_NAME = 'leads-cache-v1';

// Определяем iOS (Safari на iOS не поддерживает actions и некоторые другие опции)
const isIOS = () => {
  const ua = self.navigator?.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || 
    (ua.includes('Mac') && 'ontouchend' in self);
};

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  if (!event.data) {
    console.log('[SW] Push получен, но без данных');
    return;
  }

  let data;

  // Пробуем распарсить как JSON, если не получается - используем как текст
  try {
    data = event.data.json();
    console.log('[SW] Push data (JSON):', data);
  } catch (e) {
    // Если данные не JSON (например, тестовое сообщение), создаём объект из текста
    const textData = event.data.text();
    console.log('[SW] Push получен как текст:', textData);
    data = {
      title: 'LEADS CREATE',
      body: textData,
      type: 'text_message',
    };
  }

  try {
    const iOS = isIOS();
    console.log('[SW] Platform iOS:', iOS);
    
    // Базовые опции, совместимые с iOS
    const options = {
      body: data.body || data.message || '',
      icon: data.icon || '/img/logo/logo_v2.png',
      badge: data.badge || '/img/logo/favicon.png',
      tag: data.tag || data.type || 'default',
      data: {
        url: data.url || '/',
        type: data.type,
        orderId: data.orderId,
        ...(data.data || {}),
      },
    };

    // iOS не поддерживает эти опции - они могут вызвать silent fail
    if (!iOS) {
      options.vibrate = [200, 100, 200];
      options.renotify = true;
      options.requireInteraction = data.requireInteraction !== false;
      
      // actions тоже не поддерживаются на iOS
      if (data.type === 'call_incoming' || data.type === 'call_missed') {
        options.actions = [
          { action: 'open', title: 'Открыть' },
          { action: 'dismiss', title: 'Закрыть' },
        ];
      }
    }

    console.log('[SW] Showing notification:', data.title || 'LEADS CREATE', options);
    event.waitUntil(
      self.registration.showNotification(data.title || 'LEADS CREATE', options)
    );
  } catch (error) {
    console.error('[SW] Ошибка обработки push:', error);
  }
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  // Обработка действий
  if (event.action === 'dismiss') {
    return;
  }

  // Для звонков открываем телефонию
  if (data.type === 'call_incoming' || data.type === 'call_missed') {
    targetUrl = '/telephony';
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Ищем уже открытое окно
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: data,
            });
            if (targetUrl !== '/') {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // Открываем новое окно
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Закрытие уведомления
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  console.log('[SW] Уведомление закрыто:', data.type);
});

// Обработка изменения подписки на push
// При изменении подписки оповещаем клиент для повторной подписки с VAPID ключом
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push подписка изменилась, оповещаем клиент');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_SUBSCRIPTION_CHANGED',
            oldSubscription: event.oldSubscription ? event.oldSubscription.toJSON() : null,
            newSubscription: event.newSubscription ? event.newSubscription.toJSON() : null,
          });
        });
      })
      .catch((error) => {
        console.error('[SW] Ошибка оповещения клиента:', error);
      })
  );
});

// Установка SW
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Активация SW
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Очистка старых кэшей
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// Обработка fetch для базового кэширования
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы и API
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // Для навигационных запросов - network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Для статики - cache first
  if (
    event.request.url.includes('/_next/static/') ||
    event.request.url.includes('/img/') ||
    event.request.url.includes('/fonts/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
