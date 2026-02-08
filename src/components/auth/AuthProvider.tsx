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
  const { setUser, setLoading, isLoading, logout, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initRef = useRef(false);
  const isRestoringRef = useRef(false);

  const isPublicPage = pathname === '/login';

  // 🔧 FIX: При заходе на страницу логина - только сбрасываем loading
  // НЕ вызываем logout() здесь, так как это мешает редиректу после успешного логина
  useEffect(() => {
    if (isPublicPage) {
      setLoading(false);
    }
  }, [isPublicPage, setLoading]);

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (initRef.current && !isPublicPage) {
      return;
    }

    // Debounce для iOS PWA - предотвращаем race conditions
    let cancelled = false;
    
    const initAuth = async () => {
      // Небольшая задержка для стабилизации в PWA режиме
      await new Promise(resolve => setTimeout(resolve, 100));
      if (cancelled) return;
      try {
        // 🍪 Пропускаем проверку аутентификации на страницах логина
        if (isPublicPage) {
          setLoading(false);
          return;
        }

        initRef.current = true;

        const storedUser = await authApi.getUser();
        
        // Проверяем есть ли сохраненный пользователь
        if (!storedUser) {
          authLogger.log('No stored user found');
          setUser(null);
          setLoading(false);
          router.replace('/login');
          return;
        }

        // ✅ FIX: Унифицировано с frontend dir - проверяем через isAuthenticated + getProfile
        try {
          // Сначала проверяем валидность сессии (без interceptors)
          const isAuth = await authApi.isAuthenticated();
          
          if (isAuth) {
            // Сессия валидна - получаем профиль
            const profile = await authApi.getProfile();
            if (profile.data) {
              setUser(profile.data);
              return;
            }
          }
          
          // Сессия невалидна - пробуем восстановить через IndexedDB
          // Защита от повторных попыток восстановления
          if (isRestoringRef.current) {
            authLogger.log('Already restoring session, skipping');
            return;
          }
          
          isRestoringRef.current = true;
          authLogger.log('Session invalid, trying IndexedDB restore');
          
          try {
            const restored = await authApi.restoreSessionFromIndexedDB();
            
            if (restored) {
              authLogger.log('Session restored from IndexedDB');
              const profile = await authApi.getProfile();
              if (profile.data) {
                setUser(profile.data);
                isRestoringRef.current = false;
                return;
              }
            }
          } finally {
            isRestoringRef.current = false;
          }
          
          // Не удалось восстановить - редирект на логин
          authLogger.log('Could not restore session, redirecting to login');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
          setUser(null);
          
          if (!window.location.pathname.includes('/login')) {
            router.replace('/login');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Проверяем сетевые ошибки - НЕ редиректим
          if (errorMessage.includes('network') || 
              errorMessage.includes('сеть') || 
              errorMessage.includes('timeout') ||
              errorMessage.includes('aborted')) {
            authLogger.warn('Network error during auth check, keeping user');
            // Оставляем сохранённого пользователя, не редиректим
            if (storedUser) {
              setUser(storedUser);
            }
            return;
          }
          
          authLogger.error('Auth check failed:', errorMessage);
          
          // Очищаем и редиректим
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
          setUser(null);
          
          if (!window.location.pathname.includes('/login')) {
            router.replace('/login');
          }
        }
      } catch (error) {
        authLogger.error('Auth initialization error:', error);
        setUser(null);
        if (!window.location.pathname.includes('/login')) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading, isPublicPage, router, isAuthenticated, logout]);

  // Показываем loading для защищенных страниц до завершения проверки
  if (isLoading && !isPublicPage) {
    return <LoadingScreen message="Проверка авторизации..." />;
  }

  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}
