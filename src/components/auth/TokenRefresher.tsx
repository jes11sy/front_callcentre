'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenStorage } from '@/lib/secure-storage';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru/api/v1';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 минут (обновляем до истечения 15-минутного токена)

export function TokenRefresher() {
  const { isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Очищаем интервал если пользователь вышел
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Функция обновления токена
    const refreshToken = async () => {
      try {
        const refresh = await tokenStorage.getRefreshToken();
        if (!refresh) {
          console.log('[TokenRefresher] No refresh token, skipping...');
          return;
        }

        console.log('[TokenRefresher] Refreshing access token...');
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refresh
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        await tokenStorage.setAccessToken(accessToken);
        await tokenStorage.setRefreshToken(newRefreshToken);
        
        console.log('[TokenRefresher] Token refreshed successfully');
      } catch (error) {
        console.error('[TokenRefresher] Failed to refresh token:', error);
        // Не выкидываем пользователя - interceptor в api.ts сам обработает 401
      }
    };

    // Обновляем токен сразу при монтировании (если нужно)
    refreshToken();

    // Запускаем периодическое обновление
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);

  return null; // Компонент не рендерит ничего
}

