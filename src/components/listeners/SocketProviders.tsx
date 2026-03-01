'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { SocketAuthListener } from './SocketAuthListener';
import { CallPushListener } from './CallPushListener';

export function SocketProviders() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';

  if (isLoading || isLoginPage) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SocketAuthListener />
      <CallPushListener />
    </>
  );
}
