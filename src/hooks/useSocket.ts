import { useEffect, useRef } from 'react';
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

/**
 * @deprecated Используйте useGlobalSocket вместо useSocket.
 * Этот хук оставлен для обратной совместимости и делегирует в useGlobalSocket.
 */
export const useSocket = () => {
  socketLogger.log('useSocket called (deprecated — use useGlobalSocket)');
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (globalSocket) {
      socketRef.current = globalSocket;
      return;
    }

    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    const initSocket = async () => {
      if (!socketTokenPromise) {
        socketTokenPromise = getSocketToken();
      }
      
      const token = await socketTokenPromise;
      socketTokenPromise = null;
      
      if (!token) {
        socketLogger.warn('No auth token available for socket');
        isConnectingRef.current = false;
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

      newSocket.on('call:new', (call: unknown) => {
        socketLogger.log('NEW CALL EVENT RECEIVED:', call);
        const isPushEnabled = localStorage.getItem('push-subscribed') === 'true';
        if (!isPushEnabled) {
          notifications.info('Новый звонок получен');
        }
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
      isConnectingRef.current = false;
    };

    initSocket();

    return () => {
      if (globalSocket) {
        globalSocket.off('connect');
        globalSocket.off('disconnect');
        globalSocket.off('error');
        globalSocket.off('call:new');
        globalSocket.off('call:updated');
        globalSocket.off('call:ended');
        globalSocket.disconnect();
        globalSocket = null;
      }
      isConnectingRef.current = false;
    };
  }, []);

  return socketRef.current || globalSocket;
};
