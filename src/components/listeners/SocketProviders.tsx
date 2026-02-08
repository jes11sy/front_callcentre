'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AvitoNotificationListener } from './AvitoNotificationListener';
import { SocketAuthListener } from './SocketAuthListener';
import { CallPushListener } from './CallPushListener';

export function SocketProviders() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const pathname = usePathname();

  // 🔧 FIX: Не инициализируем сокеты на страницах логина
  const isLoginPage = pathname === '/login';

  if (isLoading || isLoginPage) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AvitoNotificationListener />
      <SocketAuthListener />
      <CallPushListener />
    </>
  );
}
