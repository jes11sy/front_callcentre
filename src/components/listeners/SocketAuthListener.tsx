'use client';

import { useEffect } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
import { socketLogger } from '@/lib/logger';

export function SocketAuthListener() {
  const { isConnected } = useGlobalSocket();

  useEffect(() => {
    // Этот компонент теперь просто следит за состоянием подключения
    // Аутентификация происходит автоматически в useGlobalSocket при подключении
    if (isConnected) {
      socketLogger.log('SocketAuthListener: Socket connected and authenticated');
    }
  }, [isConnected]);

  return null;
}
