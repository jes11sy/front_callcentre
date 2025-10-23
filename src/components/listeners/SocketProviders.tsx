'use client';

import { useAuthStore } from '@/store/authStore';
import { AvitoNotificationListener } from './AvitoNotificationListener';
import { SocketAuthListener } from './SocketAuthListener';

export function SocketProviders() {
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log('🔌 SocketProviders: Rendering with', { isAuthenticated, isLoading });

  // Не рендерим ничего пока загружается аутентификация
  if (isLoading) {
    console.log('🔌 SocketProviders: Still loading auth, returning null');
    return null;
  }

  // Рендерим слушателей ТОЛЬКО для аутентифицированных пользователей
  if (!isAuthenticated) {
    console.log('🔌 SocketProviders: User NOT authenticated, returning null');
    return null;
  }

  console.log('🔌 SocketProviders: Rendering listeners!');
  return (
    <>
      <AvitoNotificationListener />
      <SocketAuthListener />
    </>
  );
}
