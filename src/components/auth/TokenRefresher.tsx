'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { authLogger } from '@/lib/logger';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1';

const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 минуты (токен живёт 15 минут)
const INITIAL_REFRESH_DELAY = 30 * 1000; // 30 секунд после монтирования
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * TokenRefresher — проактивно обновляет httpOnly cookies сессию.
 *
 * Защита от выкидывания через 15 минут:
 * 1. Silent refresh каждые 4 минуты (интервал)
 * 2. Refresh при возврате в вкладку (visibilitychange)
 * 3. Refresh при восстановлении сети (online event)
 * 4. Fallback через IndexedDB при провале cookie-refresh
 * 5. Logout только после MAX_CONSECUTIVE_FAILURES подряд неудач
 */
export function TokenRefresher() {
  const { isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const isLoginPage = pathname === '/login';

  const doRefresh = useCallback(async (): Promise<boolean> => {
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
        authLogger.log('Silent refresh successful');
        
        if (response.data?.data?.refreshToken) {
          try {
            const { saveRefreshToken } = await import('@/lib/remember-me');
            await saveRefreshToken(response.data.data.refreshToken);
          } catch {
            // IndexedDB errors are non-critical
          }
        }
        
        return true;
      }
      return false;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      if (status === 401 || status === 403) {
        authLogger.log('Silent refresh failed - token expired or invalid');
        return false;
      }
      
      authLogger.warn('Silent refresh network error, will retry');
      return false;
    }
  }, []);

  const tryRestoreFromIndexedDB = useCallback(async (): Promise<boolean> => {
    try {
      const restored = await authApi.restoreSessionFromIndexedDB();
      if (restored) {
        authLogger.log('Session restored from IndexedDB after refresh failure');
        return true;
      }
    } catch {
      authLogger.warn('IndexedDB restore failed');
    }
    return false;
  }, []);

  const handleForceLogout = useCallback(() => {
    authLogger.log('Force logout after max consecutive failures');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('auth-storage');
    }
    storeLogout();
    router.replace('/login');
  }, [storeLogout, router]);

  const silentRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) return;

    isRefreshingRef.current = true;

    try {
      authLogger.log('Running silent refresh...');
      
      let success = await doRefresh();
      
      if (!success) {
        authLogger.log('Cookie refresh failed, trying IndexedDB fallback...');
        success = await tryRestoreFromIndexedDB();
      }

      if (success) {
        failureCountRef.current = 0;
        
        try {
          const profile = await authApi.getProfile();
          if (profile.data) {
            setUser(profile.data);
          }
        } catch {
          // Profile fetch failure is non-critical
        }
      } else {
        failureCountRef.current += 1;
        authLogger.warn(`Silent refresh failed (${failureCountRef.current}/${MAX_CONSECUTIVE_FAILURES})`);
        
        if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
          handleForceLogout();
        }
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [doRefresh, tryRestoreFromIndexedDB, setUser, handleForceLogout]);

  useEffect(() => {
    if (isLoginPage || !isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      failureCountRef.current = 0;
      return;
    }

    const initialTimeout = setTimeout(silentRefresh, INITIAL_REFRESH_DELAY);
    intervalRef.current = setInterval(silentRefresh, REFRESH_INTERVAL);

    // Refresh при возврате в вкладку (браузер замораживает таймеры в фоне)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        authLogger.log('Tab became visible, triggering refresh');
        silentRefresh();
      }
    };

    // Refresh при восстановлении сети
    const handleOnline = () => {
      authLogger.log('Network restored, triggering refresh');
      silentRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, isLoginPage, silentRefresh]);

  return null;
}

