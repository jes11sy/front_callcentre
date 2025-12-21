'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { TokenRefresher } from './TokenRefresher';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = pathname === '/login' || pathname === '/admin/login';

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 🍪 Пропускаем проверку аутентификации на страницах логина
        if (isPublicPage) {
          setLoading(false);
          return;
        }

        const storedUser = await authApi.getUser();
        const isAuthenticated = await authApi.isAuthenticated();

        if (storedUser && isAuthenticated) {
          try {
            const profile = await authApi.getProfile();
            setUser(profile.data);
          } catch {
            await authApi.logout();
            setUser(null);
            router.replace('/login');
          }
        } else {
          setUser(null);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading, pathname, isPublicPage, router]);

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
