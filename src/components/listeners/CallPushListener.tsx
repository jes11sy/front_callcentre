'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';

/**
 * Слушатель WebSocket событий для отправки push-уведомлений о звонках
 * 
 * Этот компонент слушает события call_incoming и call_missed
 * и показывает браузерные уведомления когда вкладка не активна
 */
export function CallPushListener() {
  const { on, isConnected } = useGlobalSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Проверяем поддержку и разрешение
    const canNotify = 
      'Notification' in window && 
      Notification.permission === 'granted' &&
      'serviceWorker' in navigator;

    if (!canNotify) return;

    // Слушаем входящие звонки
    const unsubIncoming = on('call:incoming', (data: {
      phone?: string;
      callerName?: string;
      callId?: string;
    }) => {
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
    const unsubMissed = on('call:missed', (data: {
      phone?: string;
      callerName?: string;
      callId?: string;
      duration?: number;
    }) => {
      showLocalNotification({
        title: 'Пропущенный звонок',
        body: data.callerName || data.phone || 'Неизвестный номер',
        tag: `call-missed-${data.callId || Date.now()}`,
        type: 'call_missed',
      });
    });

    // Также слушаем notification:new для звонков
    const unsubNotification = on('notification:new', (notification: {
      type: string;
      title: string;
      message: string;
      id: string;
    }) => {
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
  }, [isConnected, on]);

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
      icon: '/img/logo/logo_v2.png',
      badge: '/img/logo/favicon.png',
      tag: options.tag,
      renotify: true,
      requireInteraction: options.type === 'call_incoming',
      vibrate: [200, 100, 200],
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
        icon: '/img/logo/logo_v2.png',
        tag: options.tag,
      });
    } catch (fallbackError) {
      console.error('[CallPushListener] Fallback тоже не сработал:', fallbackError);
    }
  }
}
