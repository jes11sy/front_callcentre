import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 🍪 Создаем экземпляр axios с поддержкой httpOnly cookies
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Use-Cookies': 'true', // Указываем что используем cookies
  },
  withCredentials: true, // Отправляем cookies с каждым запросом
});

// 🍪 Request interceptor - добавляем X-Use-Cookies header
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Токены теперь в httpOnly cookies - не нужно добавлять вручную
    if (config.headers) {
      config.headers['X-Use-Cookies'] = 'true';
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 🍪 Response interceptor - автоматическое обновление токена при 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Проверяем условия для обновления токена
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Если токен уже обновляется, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Повторяем запрос с обновленными cookies
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[API] Refreshing access token via cookies...');
        
        // 🍪 Обновляем токен через httpOnly cookies
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1'}/auth/refresh`,
          {}, // Пустое тело для cookie-режима
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Use-Cookies': 'true',
            },
            withCredentials: true, // Отправляем cookies
          }
        );

        console.log('[API] Access token refreshed successfully via cookies');

        // Обрабатываем очередь неудавшихся запросов
        processQueue(null);

        // Повторяем исходный запрос с обновленными cookies
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh токен невалиден - выходим
        console.error('[API] Failed to refresh token:', refreshError);
        processQueue(refreshError as AxiosError);
        
        // Очищаем локальные данные и перенаправляем на логин
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 🍪 Вспомогательные функции для работы с httpOnly cookies
export const authUtils = {
  /**
   * 🍪 Сохранить токены после логина
   * Токены устанавливаются сервером в httpOnly cookies - этот метод не нужен
   * Оставляем для обратной совместимости
   */
  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    console.log('[Auth] Tokens are now stored in httpOnly cookies by the server');
    // Ничего не делаем - токены в cookies
  },

  /**
   * 🍪 Получить access токен
   * Нельзя прочитать httpOnly cookies на клиенте
   */
  getAccessToken: async (): Promise<string | null> => {
    console.warn('[Auth] Cannot read httpOnly cookies on client');
    return null;
  },

  /**
   * 🍪 Получить refresh токен
   * Нельзя прочитать httpOnly cookies на клиенте
   */
  getRefreshToken: async (): Promise<string | null> => {
    console.warn('[Auth] Cannot read httpOnly cookies on client');
    return null;
  },

  /**
   * 🍪 Проверить наличие токенов
   * Проверяем через запрос к API
   */
  hasTokens: async (): Promise<boolean> => {
    try {
      await api.get('/auth/profile');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 🍪 Очистить токены (logout)
   * Локально ничего не храним
   */
  clearTokens: (): void => {
    console.log('[Auth] No local tokens to clear - using httpOnly cookies');
  },

  /**
   * 🍪 Logout с вызовом API для очистки cookies
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[API] Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  },
};

export default api;

