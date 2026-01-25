import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notifications } from '@/components/ui/notifications';
import { socketLogger } from '@/lib/logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  socketLogger.log('useSocket called');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketLogger.log('useSocket useEffect running');
    if (globalSocket) {
      socketRef.current = globalSocket;
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      socketLogger.warn('No auth token found');
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

    return () => {
      if (globalSocket) {
        globalSocket.off('call:new');
        globalSocket.off('call:updated');
        globalSocket.off('call:ended');
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, []);

  return socketRef.current || globalSocket;
};
