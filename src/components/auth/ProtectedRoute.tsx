'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;
    if (pathname === '/login') return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace('/telephony');
    }
  }, [_hasHydrated, isLoading, pathname, requiredRole, router, user]);

  if (!_hasHydrated || isLoading) {
    return <LoadingScreen message="Проверка доступа..." />;
  }

  if (pathname !== '/login' && !user) {
    return <LoadingScreen message="Переход на авторизацию..." />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <LoadingScreen message="Недостаточно прав..." />;
  }

  return <>{children}</>;
}
