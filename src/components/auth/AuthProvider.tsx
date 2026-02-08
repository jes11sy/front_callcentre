'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { TokenRefresher } from './TokenRefresher';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { authLogger } from '@/lib/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ✅ user уже инициализирован из localStorage в store
  // ✅ FIX: Добавляем _hasHydrated для ожидания гидратации Zustand
  const { user, setUser, setLoading, isLoading, _hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initRef = useRef(false);
  const isRestoringRef = useRef(false);

  const isPublicPage = pathname === '/login';

  // 🔧 FIX: При заходе на страницу логина - только сбрасываем loading
  useEffect(() => {
    if (isPublicPage) {
      setLoading(false);
    }
  }, [isPublicPage, setLoading]);

  useEffect(() => {
    // ✅ FIX: Ждём гидратации Zustand store перед любыми действиями
    // Это предотвращает бесконечный цикл редиректов
    if (!_hasHydrated) {
      authLogger.log('Waiting for Zustand hydration...');
      return;
    }

    // Предотвращаем повторную инициализацию
    if (initRef.current) {
      return;
    }

    if (isPublicPage) {
      setLoading(false);
      return;
    }

    initRef.current = true;
    let cancelled = false;

    // ✅ Если есть пользователь в store - сразу убираем loading
    // Store уже инициализирован с данными из localStorage
    if (user) {
      authLogger.log('User already in store, showing content');
      setLoading(false);
      
      // Фоновая проверка сессии
      setTimeout(() => {
        if (!cancelled) {
          validateSessionInBackground();
        }
      }, 500);
      return;
    }

    // Нет пользователя - редирект на логин
    authLogger.log('No user in store, redirecting to login');
    setLoading(false);
    router.replace('/login');

    /**
     * Фоновая валидация сессии (без блокировки UI)
     */
    async function validateSessionInBackground() {
      try {
        const isAuth = await authApi.isAuthenticated();
        
        if (isAuth) {
          // Сессия валидна - обновляем профиль в фоне
          try {
            const profile = await authApi.getProfile();
            if (profile.data && !cancelled) {
              setUser(profile.data);
              // Сохраняем в localStorage для следующего запуска
              localStorage.setItem('user', JSON.stringify(profile.data));
            }
          } catch {
            authLogger.warn('Could not fetch profile, keeping cached user');
          }
          return;
        }
        
        // Сессия невалидна - пробуем восстановить
        authLogger.log('Session invalid, trying to restore');
        
        if (isRestoringRef.current) return;
        isRestoringRef.current = true;
        
        try {
          const restored = await authApi.restoreSessionFromIndexedDB();
          
          if (restored && !cancelled) {
            authLogger.log('Session restored from IndexedDB');
            try {
              const profile = await authApi.getProfile();
              if (profile.data) {
                setUser(profile.data);
                localStorage.setItem('user', JSON.stringify(profile.data));
              }
            } catch {
              // Оставляем кэшированного
            }
          } else if (!cancelled) {
            // Не удалось восстановить - редирект
            authLogger.log('Could not restore session');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');
            setUser(null);
            router.replace('/login');
          }
        } finally {
          isRestoringRef.current = false;
        }
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Сетевые ошибки игнорируем - пользователь уже видит контент
        if (errorMessage.includes('network') || 
            errorMessage.includes('timeout') ||
            errorMessage.includes('aborted') ||
            errorMessage.includes('Failed to fetch')) {
          authLogger.warn('Network error during background check, keeping user');
          return;
        }
        
        authLogger.error('Background auth check failed:', errorMessage);
      }
    }
    
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading, isPublicPage, router, user, _hasHydrated]);

  // ✅ Показываем loading пока ждём гидратации или если нет пользователя
  // Store инициализируется с user из localStorage, поэтому мерцания не будет
  if (!_hasHydrated || (isLoading && !isPublicPage && !user)) {
    return <LoadingScreen message="Загрузка..." />;
  }

  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}
