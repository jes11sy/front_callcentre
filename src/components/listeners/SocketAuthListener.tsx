'use client';

import { useEffect, useRef } from 'react';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';

export function SocketAuthListener() {
  const { socket, isConnected, reAuthenticate } = useGlobalSocket();
  const hasAuthedRef = useRef(false);

  useEffect(() => {
    // Когда этот компонент монтируется, пользователь аутентифицирован
    // Берём токен и переаутентифицируем сокет
    const token = localStorage.getItem('accessToken');
    
    if (token && !hasAuthedRef.current) {
      console.log('🔐 SocketAuthListener: User authenticated, re-authenticating socket');
      hasAuthedRef.current = true;
      reAuthenticate(token);
    }

    // При демонте компонента (когда пользователь выходит) - ничего не делаем
    // Socket отключится автоматически через проверку isAuthenticated в useGlobalSocket
    return () => {
      hasAuthedRef.current = false;
    };
  }, [reAuthenticate]);

  return null;
}
