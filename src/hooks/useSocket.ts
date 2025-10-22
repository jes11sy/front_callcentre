import { useEffect, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru';

// Мемоизированная конфигурация сокета
const socketConfig = {
  transports: ['polling', 'websocket'] as ('polling' | 'websocket')[],
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

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, socketConfig);

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

