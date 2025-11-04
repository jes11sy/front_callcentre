import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

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
    const newSocket = io(SOCKET_URL, socketConfig);

    // Обработка подключения
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Устанавливаем socket в state чтобы вызвать ре-рендер
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
};

