// Custom Service Worker для Push-уведомлений
// Этот файл будет объединён с автогенерируемым SW от next-pwa

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push получен, но без данных');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || data.message || '',
      icon: data.icon || '/img/logo/logo_v2.png',
      badge: '/img/logo/favicon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || data.type || 'default',
      renotify: true,
      requireInteraction: data.requireInteraction ?? true,
      data: {
        url: data.url || '/',
        type: data.type,
        orderId: data.orderId,
        ...data.data
      },
      actions: data.actions || []
    };

    // Добавляем действия для звонков
    if (data.type === 'call_incoming' || data.type === 'call_missed') {
      options.actions = [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' }
      ];
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'LEADS CREATE', options)
    );
  } catch (error) {
    console.error('[SW] Ошибка обработки push:', error);
  }
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
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
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Ищем уже открытое окно
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data
          });
          if (targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Открываем новое окно
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Закрытие уведомления
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  
  // Можно отправить на сервер информацию о закрытии
  console.log('[SW] Уведомление закрыто:', data.type);
});

// Обработка подписки на push
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push подписка изменилась');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY
    }).then((subscription) => {
      // Отправляем новую подписку на сервер
      return fetch('/api/push/resubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
  );
});
