'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { TokenRefresher } from './TokenRefresher';
import { Loader2 } from 'lucide-react';
import { authLogger } from '@/lib/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, isLoading, logout, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initRef = useRef(false);

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

    const initAuth = async () => {
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

        // Проверяем валидность сессии через API
        try {
          const profile = await authApi.getProfile();
          if (profile.data) {
            setUser(profile.data);
          } else {
            throw new Error('No profile data');
          }
        } catch (error: unknown) {
          // Проверяем тип ошибки - если это SESSION_EXPIRED, не логируем как ошибку
          if ((error as { isSessionExpired?: boolean })?.isSessionExpired) {
            authLogger.log('Session expired, trying IndexedDB restore');
          } else {
            authLogger.error('Auth check failed, trying IndexedDB restore:', error);
          }
          
          // Пробуем восстановить сессию через IndexedDB
          const restored = await authApi.restoreSessionFromIndexedDB();
          
          if (restored) {
            authLogger.log('Session restored from IndexedDB');
            // Получаем профиль после восстановления
            try {
              const profile = await authApi.getProfile();
              if (profile.data) {
                setUser(profile.data);
                return; // Успешно восстановили
              }
            } catch {
              // Ignore - go to login
            }
          }
          
          // Очищаем локальные данные
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
          }
          setUser(null);
          
          // Редирект только если еще не на странице логина
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
  }, [setUser, setLoading, isPublicPage, router, isAuthenticated, logout]);

  // Показываем loading для защищенных страниц до завершения проверки
  if (isLoading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}
