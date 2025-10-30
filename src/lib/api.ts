import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './secure-storage';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - добавляем токен в каждый запрос
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken() as string | null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - автоматическое обновление токена при 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
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
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken() as string | null;

      if (!refreshToken) {
        // Нет refresh токена - очищаем хранилище и редирект
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('[API] Refreshing access token...');
        
        // Обновляем токен
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru/api/v1'}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Сохраняем новые токены
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(newRefreshToken);

        console.log('[API] Access token refreshed successfully');

        // Обновляем заголовок в axios
        if (api.defaults.headers.common) {
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        }
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Обрабатываем очередь неудавшихся запросов
        processQueue(null, accessToken);

        // Повторяем исходный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh токен невалиден - выходим
        console.error('[API] Failed to refresh token:', refreshError);
        processQueue(refreshError as AxiosError, null);
        
        tokenStorage.clearAll();
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Вспомогательные функции для работы с токенами
export const authUtils = {
  /**
   * Сохранить токены после логина
   */
  setTokens: (accessToken: string, refreshToken: string) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);
  },

  /**
   * Получить access токен
   */
  getAccessToken: () => {
    return tokenStorage.getAccessToken() as string | null;
  },

  /**
   * Получить refresh токен
   */
  getRefreshToken: () => {
    return tokenStorage.getRefreshToken() as string | null;
  },

  /**
   * Проверить наличие токенов
   */
  hasTokens: () => {
    return !!(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
  },

  /**
   * Очистить токены (logout)
   */
  clearTokens: () => {
    tokenStorage.clearAll();
  },

  /**
   * Logout с вызовом API
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[API] Logout error:', error);
    } finally {
      authUtils.clearTokens();
      window.location.href = '/login';
    }
  },
};

export default api;

