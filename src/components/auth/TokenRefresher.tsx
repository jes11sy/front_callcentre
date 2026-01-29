'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { authLogger } from '@/lib/logger';

const CHECK_INTERVAL = 5 * 60 * 1000; // 🍪 Проверяем каждые 5 минут (реже, так как сервер сам обновляет)

/**
 * 🍪 TokenRefresher - проверяет валидность httpOnly cookies сессии
 * Не обновляет токены вручную - это делает axios interceptor
 */
export function TokenRefresher() {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoginPage = pathname === '/login';

  // 🔧 FIX: Сбрасываем состояние аутентификации при переходе на страницу логина
  // Это предотвращает циклические запросы когда zustand хранит устаревший isAuthenticated: true
  useEffect(() => {
    if (isLoginPage && isAuthenticated) {
      authLogger.log('On login page with stale auth state - clearing');
      logout();
    }
  }, [isLoginPage, isAuthenticated, logout]);

  useEffect(() => {
    // 🍪 Пропускаем на страницах логина - ПРОВЕРКА В НАЧАЛЕ
    if (isLoginPage) {
      // Очищаем интервал если есть
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!isAuthenticated) {
      // Очищаем интервал если пользователь вышел
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 🍪 Функция проверки валидности сессии
    const checkSession = async () => {
      // Дополнительная проверка - не запускаем если на странице логина
      if (window.location.pathname.includes('/login')) {
        authLogger.log('Skipping session check - on login page');
        return;
      }
      
      try {
        authLogger.log('Checking session validity...');
        
        // Проверяем валидность сессии через profile запрос
        const profile = await authApi.getProfile();
        
        // Обновляем данные пользователя если они изменились
        if (profile.data) {
          setUser(profile.data);
        }
        
        authLogger.log('Session is valid');
      } catch (error) {
        authLogger.error('Session check failed:', error);
        // Не выкидываем пользователя - interceptor в api.ts сам обработает 401
      }
    };

    // Проверяем сессию сразу при монтировании (с небольшой задержкой для стабильности)
    const initialCheckTimeout = setTimeout(checkSession, 100);

    // Запускаем периодическую проверку
    intervalRef.current = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, setUser, isLoginPage]);

  return null; // Компонент не рендерит ничего
}

