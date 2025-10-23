'use client';

import { useAuthStore } from '@/store/authStore';
import { AvitoNotificationListener } from './AvitoNotificationListener';
import { SocketAuthListener } from './SocketAuthListener';

export function SocketProviders() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Не рендерим ничего пока загружается аутентификация
  if (isLoading) {
    return null;
  }

  // Рендерим слушателей ТОЛЬКО для аутентифицированных пользователей
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AvitoNotificationListener />
      <SocketAuthListener />
    </>
  );
}
