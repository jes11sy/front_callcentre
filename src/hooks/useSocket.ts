import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (globalSocket) {
      socketRef.current = globalSocket;
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.warn('⚠️ No auth token found');
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
      console.log('✅ WebSocket connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    globalSocket = newSocket;
    socketRef.current = newSocket;

    return () => {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
    };
  }, []);

  return socketRef.current || globalSocket;
};
