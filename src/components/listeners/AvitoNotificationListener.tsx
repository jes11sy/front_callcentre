'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
import { notifications } from '@/components/ui/notifications';
import { playMessageSound } from '@/lib/sound';

export function AvitoNotificationListener() {
  const { socket, isConnected } = useGlobalSocket();

  useEffect(() => {
    console.log('📢 AvitoNotificationListener: Mounted, socket:', !!socket, 'isConnected:', isConnected);
    
    if (!socket || !isConnected) {
      console.log('📢 AvitoNotificationListener: Socket not ready, waiting...');
      return;
    }

    console.log('📢 AvitoNotificationListener: Registering avito-notification listener');

    // Слушаем avito-notification событие везде, независимо от страницы
    const notificationHandler = (...args: unknown[]) => {
      const data = args[0] as {
        type: string;
        chatId: string;
        messageId: string;
        message?: any;
        timestamp: number;
      };

      console.log('📢 AvitoNotificationListener: Got notification event:', data.type);

      if (data.type === 'new_message') {
        // Play sound for notification
        playMessageSound();
        
        // Show notification with custom styling
        notifications.info('Новое сообщение на Авито!');
      }
    };

    socket.on('avito-notification', notificationHandler);
    console.log('📢 AvitoNotificationListener: Listener registered');

    // Cleanup
    return () => {
      console.log('📢 AvitoNotificationListener: Cleaning up listener');
      socket.off('avito-notification', notificationHandler);
    };
  }, [socket, isConnected]);

  // Компонент не рендерит ничего, только слушает события
  return null;
}
