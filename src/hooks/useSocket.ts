import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { notifications } from '@/components/ui/notifications';
import { socketLogger } from '@/lib/logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://api.lead-schem.ru';

let globalSocket: Socket | null = null;
let socketTokenPromise: Promise<string | null> | null = null;

/**
 * ✅ FIX #40: Получаем токен для сокета через API вместо localStorage
 * Токены теперь хранятся в httpOnly cookies, поэтому нужен специальный endpoint
 */
async function getSocketToken(): Promise<string | null> {
  try {
    const response = await fetch(`${AUTH_API_URL}/api/v1/auth/socket-token`, {
      method: 'GET',
      credentials: 'include', // Отправляем httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      socketLogger.warn('Failed to get socket token:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.data?.token || null;
  } catch (error) {
    socketLogger.error('Error getting socket token:', error);
    return null;
  }
}

export const useSocket = () => {
  socketLogger.log('useSocket called');
  const socketRef = useRef<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    socketLogger.log('useSocket useEffect running');
    if (globalSocket) {
      socketRef.current = globalSocket;
      return;
    }

    // Предотвращаем множественные запросы токена
    if (isConnecting) return;
    setIsConnecting(true);

    // ✅ FIX #40: Получаем токен через API вместо localStorage
    const initSocket = async () => {
      // Используем кешированный промис для предотвращения дублирования запросов
      if (!socketTokenPromise) {
        socketTokenPromise = getSocketToken();
      }
      
      const token = await socketTokenPromise;
      socketTokenPromise = null; // Сбрасываем после получения
      
      if (!token) {
        socketLogger.warn('No auth token available for socket');
        setIsConnecting(false);
        return;
      }

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
        timeout: 10000,
        autoConnect: true,
        forceNew: false,
        path: '/socket.io/'
      });

    newSocket.on('connect', () => {
      socketLogger.log('WebSocket connected');
    });

    newSocket.on('disconnect', (reason) => {
      socketLogger.log('WebSocket disconnected:', reason);
    });

    newSocket.on('error', (error) => {
      socketLogger.error('WebSocket error:', error);
    });

    // РЕГИСТРИРУЕМ LISTENERS ТУТ ЖЕ
    newSocket.on('call:new', (call: unknown) => {
      socketLogger.log('NEW CALL EVENT RECEIVED:', call);
      notifications.info('Новый звонок получен');
      
      // Dispatch custom event для useCallsData
      window.dispatchEvent(new CustomEvent('socket:call:new', { detail: call }));
    });

    newSocket.on('call:updated', (call: unknown) => {
      socketLogger.log('CALL UPDATED EVENT RECEIVED:', call);
      window.dispatchEvent(new CustomEvent('socket:call:updated', { detail: call }));
    });

    newSocket.on('call:ended', (call: unknown) => {
      socketLogger.log('CALL ENDED EVENT RECEIVED:', call);
      window.dispatchEvent(new CustomEvent('socket:call:ended', { detail: call }));
    });

      globalSocket = newSocket;
      socketRef.current = newSocket;
      setIsConnecting(false);
    };

    initSocket();

    return () => {
      if (globalSocket) {
        // ✅ FIX: Очищаем ВСЕ слушатели, включая connect/disconnect/error
        globalSocket.off('connect');
        globalSocket.off('disconnect');
        globalSocket.off('error');
        globalSocket.off('call:new');
        globalSocket.off('call:updated');
        globalSocket.off('call:ended');
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, [isConnecting]);

  return socketRef.current || globalSocket;
};
