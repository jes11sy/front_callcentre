'use client';

import { useAuthStore } from '@/store/authStore';
import { AvitoNotificationListener } from './AvitoNotificationListener';
import { SocketAuthListener } from './SocketAuthListener';

export function SocketProviders() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

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
