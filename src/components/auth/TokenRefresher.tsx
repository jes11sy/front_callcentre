'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tokenStorage } from '@/lib/secure-storage';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1';
const CHECK_INTERVAL = 60 * 1000; // Проверяем каждую минуту

// Декодирование JWT токена
function decodeJWT(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

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

    // Функция проверки и обновления токена
    const checkAndRefreshToken = async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        const refresh = await tokenStorage.getRefreshToken();
        
        if (!accessToken || !refresh) {
          console.log('[TokenRefresher] No tokens, skipping...');
          return;
        }

        // Декодируем токен и проверяем время истечения
        const decoded = decodeJWT(accessToken as string);
        if (decoded?.exp) {
          const expiryTime = decoded.exp * 1000; // В миллисекунды
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;

          // Обновляем токен за 2 минуты до истечения
          if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
            console.log('[TokenRefresher] Token expires soon, refreshing...');
            
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: refresh
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
            const rememberMe = await tokenStorage.getRememberMe();
            
            await tokenStorage.setAccessToken(newAccessToken, rememberMe);
            await tokenStorage.setRefreshToken(newRefreshToken, rememberMe);
            
            console.log('[TokenRefresher] Token refreshed successfully');
          }
        }
      } catch (error) {
        console.error('[TokenRefresher] Failed to refresh token:', error);
        // Не выкидываем пользователя - interceptor в api.ts сам обработает 401
      }
    };

    // Проверяем токен сразу при монтировании
    checkAndRefreshToken();

    // Запускаем периодическую проверку
    intervalRef.current = setInterval(checkAndRefreshToken, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated]);

  return null; // Компонент не рендерит ничего
}

