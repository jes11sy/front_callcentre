'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { TokenRefresher } from './TokenRefresher';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { authLogger } from '@/lib/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Проверяет, запущено ли приложение в PWA режиме
 */
function isPWAMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setUser, setLoading, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initRef = useRef(false);
  const isRestoringRef = useRef(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const isPublicPage = pathname === '/login';

  // 🔧 FIX: При заходе на страницу логина - только сбрасываем loading
  useEffect(() => {
    if (isPublicPage) {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [isPublicPage, setLoading]);

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (initRef.current && !isPublicPage) {
      return;
    }

    let cancelled = false;
    
    const initAuth = async () => {
      try {
        if (isPublicPage) {
          setLoading(false);
          setInitialCheckDone(true);
          return;
        }

        initRef.current = true;

        // ✅ Синхронное чтение из localStorage (мгновенно)
        let storedUser = null;
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (userStr) {
            try {
              storedUser = JSON.parse(userStr);
            } catch {
              storedUser = null;
            }
          }
        }
        
        // Нет сохранённого пользователя - редирект на логин
        if (!storedUser) {
          authLogger.log('No stored user found');
          setUser(null);
          setLoading(false);
          setInitialCheckDone(true);
          router.replace('/login');
          return;
        }

        // ✅ ВСЕГДА сразу показываем контент с кэшированным пользователем
        // Независимо от PWA режима — это убирает мерцание
        authLogger.log('Showing cached user immediately');
        setUser(storedUser);
        setLoading(false);
        setInitialCheckDone(true);
        
        // Проверяем сессию в фоне (без блокировки UI)
        setTimeout(() => {
          if (cancelled) return;
          validateSessionInBackground(storedUser);
        }, 300);
        
      } catch (error) {
        authLogger.error('Auth initialization error:', error);
        setUser(null);
        setLoading(false);
        setInitialCheckDone(true);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          router.replace('/login');
        }
      }
    };

    /**
     * Фоновая валидация сессии (без блокировки UI)
     */
    const validateSessionInBackground = async (storedUser: typeof user) => {
      try {
        const isAuth = await authApi.isAuthenticated();
        
        if (isAuth) {
          // Сессия валидна - обновляем профиль в фоне
          try {
            const profile = await authApi.getProfile();
            if (profile.data && !cancelled) {
              setUser(profile.data);
            }
          } catch {
            // Ошибка получения профиля - оставляем кэшированного
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
              }
            } catch {
              // Оставляем кэшированного
            }
          } else if (!cancelled) {
            // Не удалось восстановить - редирект
            authLogger.log('Could not restore session');
            clearUserData();
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
    };

    /**
     * Очистка данных пользователя
     */
    const clearUserData = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    };

    initAuth();
    
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading, isPublicPage, router, user]);

  // Показываем loading только при первой загрузке и если нет пользователя
  if (!initialCheckDone && !isPublicPage && !user) {
    return <LoadingScreen message="Загрузка..." />;
  }

  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}
