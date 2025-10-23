'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
import { notifications } from '@/components/ui/notifications';
import { playMessageSound } from '@/lib/sound';

export function AvitoNotificationListener() {
  const { socket, isConnected } = useGlobalSocket();

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Слушаем avito-notification событие везде, независимо от страницы
    const notificationHandler = (...args: unknown[]) => {
      const data = args[0] as {
        type: string;
        chatId: string;
        messageId: string;
        message?: any;
        timestamp: number;
      };

      if (data.type === 'new_message') {
        // Play sound for notification
        playMessageSound();
        
        // Show notification with custom styling
        notifications.info('Новое сообщение на Авито!');
      }
    };

    socket.on('avito-notification', notificationHandler);

    // Cleanup
    return () => {
      socket.off('avito-notification', notificationHandler);
    };
  }, [socket, isConnected]);

  // Компонент не рендерит ничего, только слушает события
  return null;
}
