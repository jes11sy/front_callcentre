// Ленивая загрузка Socket.IO
// Загружает socket.io-client только когда действительно нужен

import { useEffect, useState } from 'react';
import { useGlobalSocket } from './useGlobalSocket';

interface LazySocketOptions {
  enabled?: boolean;
  autoConnect?: boolean;
}

export function useLazySocket(options: LazySocketOptions = {}) {
  const { enabled = true, autoConnect = true } = options;
  const [socket, setSocket] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const loadSocket = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Динамически импортируем socket.io-client
        const { io } = await import('socket.io-client');
        
        // Создаем соединение только если autoConnect включен
        if (autoConnect) {
          const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            transports: ['websocket'],
            timeout: 20000,
            forceNew: true
          });
          
          setSocket(socketInstance);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load Socket.IO:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocket();

    // Cleanup при размонтировании
    return () => {
      if (socket) {
        (socket as { disconnect: () => void }).disconnect();
      }
    };
  }, [enabled, autoConnect, socket]);

  return {
    socket,
    isLoading,
    error,
    isConnected: (socket as { connected?: boolean })?.connected || false
  };
}

// Хук для ленивой загрузки Socket.IO с глобальным состоянием
export function useLazyGlobalSocket() {
  const [isSocketLoaded, setIsSocketLoaded] = useState(false);
  const globalSocket = useGlobalSocket();

  useEffect(() => {
    // Загружаем Socket.IO только когда компонент монтируется
    const loadSocket = async () => {
      try {
        await import('socket.io-client');
        setIsSocketLoaded(true);
      } catch (error) {
        console.error('Failed to load Socket.IO:', error);
      }
    };

    loadSocket();
  }, []);

  return {
    ...globalSocket,
    isSocketLoaded
  };
}