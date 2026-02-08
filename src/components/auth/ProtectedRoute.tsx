'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Редирект только если loading закончился и нет пользователя
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // ✅ PWA FIX: Если есть user - сразу показываем контент
  // Не ждём isLoading - store инициализируется с user из localStorage
  if (user) {
    return <>{children}</>;
  }

  // Нет user и ещё loading - показываем загрузку
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Нет user и loading закончился - редирект (ничего не показываем)
  return null;
}
