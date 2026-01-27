import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

// Мемоизированная конфигурация сокета
const socketConfig = {
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

export const useSimpleSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  // ✅ FIX: Используем state вместо useMemo для реактивного обновления
  // useMemo с [] всегда возвращал null, т.к. вычислялся только при первом рендере
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, socketConfig);
    socketRef.current = newSocket;
    setSocket(newSocket); // ✅ Обновляем state для ре-рендера

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, []);

  // ✅ FIX: Возвращаем state который корректно обновляется после подключения
  return socket;
};

