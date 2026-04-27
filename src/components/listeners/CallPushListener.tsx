'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Слушатель WebSocket событий для отправки push-уведомлений о звонках
 * 
 * Этот компонент слушает события call_incoming и call_missed
 * и показывает браузерные уведомления когда вкладка не активна
 * 
 * ВАЖНО: Если push уведомления включены на сервере, локальные уведомления
 * не показываются, чтобы избежать дублирования
 */
export function CallPushListener() {
  const { on, isConnected } = useGlobalSocket();
  const { isSubscribed: isPushSubscribed } = usePushNotifications();

  useEffect(() => {
    if (!isConnected) return;

    // Если push включен - сервер сам пришлёт уведомление, не дублируем
    if (isPushSubscribed) {
      console.log('[CallPushListener] Push включен, локальные уведомления отключены');
      return;
    }

    // Проверяем поддержку и разрешение
    const canNotify = 
      'Notification' in window && 
      Notification.permission === 'granted' &&
      'serviceWorker' in navigator;

    if (!canNotify) return;

    // Слушаем входящие звонки
    const unsubIncoming = on('call:incoming', (...args: unknown[]) => {
      const data = (args[0] ?? {}) as {
        phone?: string;
        callerName?: string;
        callId?: string;
      };
      // Показываем уведомление только если вкладка не активна
      if (document.visibilityState === 'hidden') {
        showLocalNotification({
          title: 'Входящий звонок',
          body: data.callerName || data.phone || 'Неизвестный номер',
          tag: `call-incoming-${data.callId || Date.now()}`,
          type: 'call_incoming',
        });
      }
    });

    // Слушаем пропущенные звонки
    const unsubMissed = on('call:missed', (...args: unknown[]) => {
      const data = (args[0] ?? {}) as {
        phone?: string;
        callerName?: string;
        callId?: string;
      };
      showLocalNotification({
        title: 'Пропущенный звонок',
        body: data.callerName || data.phone || 'Неизвестный номер',
        tag: `call-missed-${data.callId || Date.now()}`,
        type: 'call_missed',
      });
    });

    // Также слушаем notification:new для звонков
    const unsubNotification = on('notification:new', (...args: unknown[]) => {
      const notification = (args[0] ?? {}) as {
        type: string;
        title: string;
        message: string;
        id: string;
      };
      if (notification.type === 'call_incoming' || notification.type === 'call_missed') {
        // Показываем только если вкладка не активна (для incoming)
        // или всегда (для missed)
        if (notification.type === 'call_missed' || document.visibilityState === 'hidden') {
          showLocalNotification({
            title: notification.title,
            body: notification.message,
            tag: `notification-${notification.id}`,
            type: notification.type,
          });
        }
      }
    });

    return () => {
      unsubIncoming();
      unsubMissed();
      unsubNotification();
    };
  }, [isConnected, on, isPushSubscribed]);

  return null;
}

/**
 * Показывает локальное браузерное уведомление
 */
async function showLocalNotification(options: {
  title: string;
  body: string;
  tag: string;
  type: string;
}) {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: '/img/logo/pwa_logo.png',
      badge: '/img/logo/favicon.png',
      tag: options.tag,
      requireInteraction: options.type === 'call_incoming',
      data: {
        type: options.type,
        url: '/telephony',
      },
    });
  } catch (error) {
    console.error('[CallPushListener] Ошибка показа уведомления:', error);
    
    // Fallback на обычный Notification API
    try {
      new Notification(options.title, {
        body: options.body,
        icon: '/img/logo/pwa_logo.png',
        tag: options.tag,
      });
    } catch (fallbackError) {
      console.error('[CallPushListener] Fallback тоже не сработал:', fallbackError);
    }
  }
}
