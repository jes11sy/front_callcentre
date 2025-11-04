import { useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Получаем токен из localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.warn('⚠️ No auth token found, WebSocket authentication will fail');
      return;
    }

    // Конфигурация сокета с токеном
    const socketConfig = {
      auth: {
        token: token,
      },
      transports: ['websocket'] as ('websocket')[],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
      timeout: 10000,
      autoConnect: true,
      forceNew: false,
      path: '/socket.io/'
    };

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, socketConfig);

    // Обработка подключения
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socketRef.current.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Мемоизируем возвращаемое значение
  return useMemo(() => socketRef.current, []);
};

