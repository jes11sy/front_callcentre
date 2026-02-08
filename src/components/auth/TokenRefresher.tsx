'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { authLogger } from '@/lib/logger';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1';

// 🔄 Silent Refresh - обновляем токен каждые 4 минуты (токен живёт 15 минут)
const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 минуты

/**
 * 🍪 TokenRefresher - проактивно обновляет httpOnly cookies сессию
 * ✅ FIX: Добавлен Silent Refresh аналогично frontend dir
 * Обновляет токены каждые 4 минуты пока страница открыта
 */
export function TokenRefresher() {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoginPage = pathname === '/login';

  // ✅ FIX: Убран автоматический logout на странице логина
  // Это вызывало race condition с гидратацией Zustand и бесконечные редиректы
  // Теперь AuthProvider и ProtectedRoute ждут гидратации перед принятием решений

  // 🔄 Функция обновления токена через /auth/refresh
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Use-Cookies': 'true',
          },
          timeout: 10000,
        }
      );

      if (response.data?.success) {
        authLogger.log('🔄 Silent refresh successful');
        
        // Обновляем refresh token в IndexedDB если пришёл новый
        if (response.data?.data?.refreshToken) {
          try {
            const { saveRefreshToken } = await import('@/lib/remember-me');
            await saveRefreshToken(response.data.data.refreshToken);
          } catch (e) {
            // Ignore IndexedDB errors
          }
        }
        
        return true;
      }
      return false;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      // 401/403 - токен невалиден, не логируем как ошибку
      if (status === 401 || status === 403) {
        authLogger.log('Silent refresh failed - token expired or invalid');
        return false;
      }
      
      // Сетевые ошибки - просто пропускаем, попробуем позже
      authLogger.warn('Silent refresh network error, will retry');
      return false;
    }
  }, []);

  useEffect(() => {
    // 🍪 Пропускаем на страницах логина
    if (isLoginPage) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 🔄 Silent Refresh - обновляем токен каждые 4 минуты пока страница открыта
    const silentRefresh = async () => {
      // Проверяем что не на странице логина
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
        authLogger.log('Skipping silent refresh - on login page');
        return;
      }

      authLogger.log('🔄 Running silent refresh...');
      
      const success = await refreshToken();
      
      if (success) {
        // Опционально: обновляем профиль после refresh
        try {
          const profile = await authApi.getProfile();
          if (profile.data) {
            setUser(profile.data);
          }
        } catch {
          // Игнорируем ошибки получения профиля
        }
      }
    };

    // Запускаем первый refresh через 1 минуту (даём время на инициализацию)
    const initialTimeout = setTimeout(silentRefresh, 60 * 1000);

    // Запускаем периодический refresh каждые 4 минуты
    intervalRef.current = setInterval(silentRefresh, REFRESH_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, setUser, isLoginPage, refreshToken]);

  return null; // Компонент не рендерит ничего
}

