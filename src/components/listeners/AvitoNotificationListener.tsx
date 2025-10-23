'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
import { notifications } from '@/components/ui/notifications';
import { playMessageSound } from '@/lib/sound';

export function AvitoNotificationListener() {
  const { socket } = useGlobalSocket();

  useEffect(() => {
    // Если socket еще не создан, не регистрируем слушателя
    if (!socket) {
      return;
    }

    // Слушаем avito-notification событие
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
  }, [socket]);

  return null;
}
