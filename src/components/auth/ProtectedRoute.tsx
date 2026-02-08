'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // ✅ FIX: Добавляем _hasHydrated для ожидания гидратации Zustand
  const { user, login: authLogin, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    // ✅ FIX: Ждём гидратации Zustand store перед проверкой авторизации
    // Это предотвращает преждевременный редирект на /login
    if (!_hasHydrated) {
      return;
    }

    // Проверяем только один раз
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      // Если user уже есть в store - сразу показываем контент
      if (user) {
        setIsChecking(false);
        return;
      }

      // User нет в store - проверяем через API (cookies)
      try {
        const response = await authApi.getProfile().catch(() => null);
        if (response?.success && response.data) {
          // Авторизован через cookies - обновляем store
          authLogin(response.data);
          setIsChecking(false);
          return;
        }
      } catch {
        // Ошибка API
      }

      // Не авторизован - редирект на логин
      router.replace('/login');
    };

    checkAuth();
  }, [user, authLogin, router, _hasHydrated]);

  // ✅ FIX: Показываем загрузку пока ждём гидратации
  if (!_hasHydrated) {
    return <LoadingScreen />;
  }

  // Показываем загрузку пока проверяем
  if (isChecking && !user) {
    return <LoadingScreen />;
  }

  // Если есть user - показываем контент
  if (user) {
    return <>{children}</>;
  }

  // Редирект в процессе
  return <LoadingScreen />;
}
