/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Интерфейс для данных push-уведомления
interface PushNotificationData {
  title?: string;
  body?: string;
  message?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  type?: string;
  url?: string;
  orderId?: number;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

// Обработка push-уведомлений
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) {
    console.log('[SW] Push получен, но без данных');
    return;
  }

  let data: PushNotificationData;

  // Пробуем распарсить как JSON, если не получается - используем как текст
  try {
    data = event.data.json() as PushNotificationData;
  } catch {
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
    const options: NotificationOptions = {
      body: data.body || data.message || '',
      icon: data.icon || '/img/logo/logo_v2.png',
      badge: data.badge || '/img/logo/favicon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || data.type || 'default',
      renotify: true,
      requireInteraction: data.requireInteraction ?? true,
      data: {
        url: data.url || '/',
        type: data.type,
        orderId: data.orderId,
        ...(data.data || {}),
      },
      actions: data.actions || [],
    };

    // Добавляем действия для звонков
    if (data.type === 'call_incoming' || data.type === 'call_missed') {
      options.actions = [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' },
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
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const data = (event.notification.data as Record<string, unknown>) || {};
  let targetUrl = (data.url as string) || '/';

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
              (client as WindowClient).navigate(targetUrl);
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
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  const data = (event.notification.data as Record<string, unknown>) || {};

  // Можно отправить на сервер информацию о закрытии
  console.log('[SW] Уведомление закрыто:', data.type);
});

// Обработка подписки на push
self.addEventListener('pushsubscriptionchange', ((event: Event) => {
  const pushEvent = event as ExtendableEvent & {
    oldSubscription?: PushSubscription;
    newSubscription?: PushSubscription;
  };

  console.log('[SW] Push подписка изменилась');

  pushEvent.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        // applicationServerKey будет использован из существующей подписки
      })
      .then((subscription) => {
        // Отправляем новую подписку на сервер
        return fetch('/api/push/resubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
      .catch((error) => {
        console.error('[SW] Ошибка переподписки:', error);
      })
  );
}) as EventListener);

export {};
