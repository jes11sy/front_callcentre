// ✅ FIX #151: Добавлен axios retry logic
import axios from 'axios';
import { authLogger } from '@/lib/logger';
import { setupAxiosRetry, classifyAxiosError, getUserFriendlyAxiosError } from './axios-retry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1';

export interface LoginCredentials {
  login: string;
  password: string;
  role: 'admin' | 'operator';
  rememberMe?: boolean;
}

export interface User {
  id: number;
  login: string;
  role: 'admin' | 'operator';
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string; // Не используется с cookies
    refreshToken?: string; // Не используется с cookies
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User & {
    city?: string;
    status?: string;
    statusWork?: string;
    dateCreate?: string;
    note?: string;
    createdAt?: string;
  };
}

// 🍪 Create axios instance with httpOnly cookies support
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Отправляем cookies с каждым запросом
  timeout: 15000, // ✅ FIX #151: 15 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
    'X-Use-Cookies': 'true', // Указываем что используем cookies
  },
});

// 🔒 Отдельный axios instance БЕЗ интерцепторов для refresh запросов
// Это предотвращает рекурсивные вызовы refresh при ошибках
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
    'X-Use-Cookies': 'true',
  },
});

// ✅ FIX #151: Настраиваем retry для основного API instance
setupAxiosRetry(api, {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: true,
  retryOnStatus: [502, 503, 504, 0], // 0 - сетевые ошибки
});

// ✅ FIX #151: Настраиваем retry для refresh API instance
setupAxiosRetry(refreshApi, {
  maxRetries: 2,
  retryDelay: 500,
  backoff: true,
  retryOnStatus: [502, 503, 504, 0],
});

// 🍪 Request interceptor - добавляем X-Use-Cookies header
api.interceptors.request.use(async (config) => {
  // Токены теперь в httpOnly cookies - не нужно добавлять вручную
  config.headers['X-Use-Cookies'] = 'true';
  return config;
});

// 🍪 Response interceptor - автоматическое обновление токена при 401
// ✅ FIX: Mutex для предотвращения race condition при параллельных refresh запросах
let refreshPromise: Promise<boolean> | null = null;
let refreshSubscribers: Array<(success: boolean) => void> = [];

/**
 * Выполняет refresh токена с mutex защитой
 * Если refresh уже выполняется - возвращает тот же Promise
 */
const doRefreshWithMutex = async (): Promise<boolean> => {
  // Если refresh уже выполняется - ждём его результат
  if (refreshPromise) {
    authLogger.log('[Auth] Refresh already in progress, waiting...');
    return refreshPromise;
  }
  
  // Создаём новый Promise для refresh
  refreshPromise = (async () => {
    try {
      authLogger.log('[Auth] Starting token refresh');
      const refreshResponse = await refreshApi.post('/auth/refresh', {});
      
      if (!refreshResponse.data?.success) {
        authLogger.warn('[Auth] Refresh response not successful');
        return false;
      }
      
      authLogger.log('[Auth] Token refresh successful');
      return true;
    } catch (error) {
      authLogger.error('[Auth] Token refresh failed:', error);
      return false;
    }
  })();
  
  try {
    const result = await refreshPromise;
    // Оповещаем подписчиков о результате
    refreshSubscribers.forEach(cb => cb(result));
    refreshSubscribers = [];
    return result;
  } finally {
    // Сбрасываем Promise после завершения
    refreshPromise = null;
  }
};

// ✅ FIX: Убраны редиректы из interceptor - редиректами занимается AuthProvider
// Это унифицирует поведение с другими фронтами (frontend dir, front admin)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || '';
    const originalRequest = error.config;
    
    // Пропускаем обработку для auth endpoints
    if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    
    // Предотвращаем повторные попытки обновления токена
    if (originalRequest._retry) {
      const sessionError = new Error('SESSION_EXPIRED');
      (sessionError as any).isSessionExpired = true;
      return Promise.reject(sessionError);
    }
    
    // Обрабатываем 401 ошибки (токен истек или отсутствует)
    if (error.response?.status === 401) {
      // Если refresh уже идёт - подписываемся на завершение
      if (refreshPromise) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success) => {
            if (success) {
              originalRequest._retry = true;
              api.request(originalRequest).then(resolve).catch(reject);
            } else {
              const sessionError = new Error('SESSION_EXPIRED');
              (sessionError as any).isSessionExpired = true;
              reject(sessionError);
            }
          });
        });
      }
      
      // Выполняем refresh с mutex защитой
      const refreshSuccess = await doRefreshWithMutex();
      
      if (refreshSuccess) {
        // Повторяем исходный запрос с обновленными cookies
        originalRequest._retry = true;
        return api.request(originalRequest);
      } else {
        // НЕ делаем редирект здесь - пусть AuthProvider решает
        const sessionError = new Error('SESSION_EXPIRED');
        (sessionError as any).isSessionExpired = true;
        return Promise.reject(sessionError);
      }
    }
    return Promise.reject(error);
  }
);

// 🍪 authApi methods for httpOnly cookies
export const authApi = {
  /**
   * 🍪 Login - токены устанавливаются сервером в httpOnly cookies
   * Также сохраняем refresh token в IndexedDB как backup для iOS PWA
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      login: credentials.login,
      password: credentials.password,
      role: credentials.role
    });
    
    // Сохраняем refresh token в IndexedDB (backup для iOS PWA)
    if (response.data?.success && response.data?.data?.refreshToken) {
      try {
        const { saveRefreshToken } = await import('./remember-me');
        await saveRefreshToken(response.data.data.refreshToken);
        authLogger.log('Refresh token saved to IndexedDB');
      } catch (error) {
        authLogger.error('Failed to save refresh token to IndexedDB:', error);
        // Не прерываем логин
      }
    }
    
    return response.data;
  },

  /**
   * 🍪 Logout - очищает httpOnly cookies на сервере
   */
  logout: async (): Promise<void> => {
    // Очищаем refresh token из IndexedDB
    try {
      const { clearRefreshToken } = await import('./remember-me');
      await clearRefreshToken();
    } catch (error) {
      authLogger.error('Failed to clear refresh token from IndexedDB:', error);
    }
    
    try {
      await api.post('/auth/logout', {}); // Пустой объект для POST запроса
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      // Очищаем все данные авторизации из storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        // Очищаем Zustand persist storage
        sessionStorage.removeItem('auth-storage');
        localStorage.removeItem('auth-storage');
      }
    }
  },

  /**
   * 🍪 Get profile - проверяет валидность сессии
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * 🍪 Save tokens - не нужно, токены в cookies
   * Оставляем для обратной совместимости
   */
  saveTokens: async (_accessToken: string, _refreshToken: string, _rememberMe: boolean = false) => {
    authLogger.log('Tokens are stored in httpOnly cookies by the server');
    // Ничего не делаем
  },

  /**
   * 🍪 Save user - сохраняем только пользователя в localStorage
   * ✅ FIX #150: Санитизация данных перед сохранением
   */
  saveUser: async (user: User, rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      const { sanitizeObject } = await import('./xss-protection');
      const sanitizedUser = sanitizeObject(user as Record<string, unknown>);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(sanitizedUser));
    }
  },

  /**
   * 🍪 Get user - получаем из localStorage
   */
  getUser: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 🍪 Is authenticated - проверяем через API
   * ✅ FIX: Используем fetch напрямую БЕЗ axios interceptors
   * Это предотвращает нежелательные редиректы при проверке на странице логина
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Use-Cookies': 'true',
        },
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * 🔄 Восстановление сессии через refresh token из IndexedDB
   * Используется когда cookies удалены (iOS ITP, PWA)
   * @returns true если сессия восстановлена
   */
  restoreSessionFromIndexedDB: async (): Promise<boolean> => {
    try {
      const { getRefreshToken, saveRefreshToken, clearRefreshToken } = await import('./remember-me');
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        authLogger.log('No refresh token in IndexedDB');
        return false;
      }
      
      authLogger.log('Found refresh token in IndexedDB, attempting to restore session');
      
      // Отправляем refresh token на сервер для получения новых cookies
      // Используем refreshApi чтобы избежать интерцепторов
      const response = await refreshApi.post('/auth/refresh', { refreshToken });
      
      if (response.data?.success) {
        // Обновляем токен в IndexedDB если пришёл новый
        if (response.data?.data?.refreshToken) {
          await saveRefreshToken(response.data.data.refreshToken);
        }
        
        authLogger.log('Session restored from IndexedDB token');
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      // Токен невалиден — очищаем IndexedDB
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        authLogger.log('Refresh token from IndexedDB is invalid, clearing');
        try {
          const { clearRefreshToken } = await import('./remember-me');
          await clearRefreshToken();
        } catch {
          // Ignore
        }
      }
      
      authLogger.error('Failed to restore session from IndexedDB:', error);
      return false;
    }
  },

  // Generic API methods for authenticated requests
  get: (url: string, config?: unknown) => api.get(url, config as Record<string, unknown>),
  post: (url: string, data?: unknown, config?: unknown) => api.post(url, data, config as Record<string, unknown>),
  put: (url: string, data?: unknown, config?: unknown) => api.put(url, data, config as Record<string, unknown>),
  delete: (url: string, config?: unknown) => api.delete(url, config as Record<string, unknown>),
};

// ✅ FIX #151: Экспортируем утилиты для обработки ошибок
export { classifyAxiosError, getUserFriendlyAxiosError } from './axios-retry';

// Export the axios instance for direct API calls
export default api;
