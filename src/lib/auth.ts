import axios from 'axios';

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
  headers: {
    'Content-Type': 'application/json',
    'X-Use-Cookies': 'true', // Указываем что используем cookies
  },
});

// 🍪 Request interceptor - добавляем X-Use-Cookies header
api.interceptors.request.use(async (config) => {
  // Токены теперь в httpOnly cookies - не нужно добавлять вручную
  config.headers['X-Use-Cookies'] = 'true';
  return config;
});

// 🍪 Response interceptor - автоматическое обновление токена при 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Обрабатываем 401 ошибки (кроме login и refresh)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/refresh')) {
      try {
        // Обновляем токен через httpOnly cookies
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'X-Use-Cookies': 'true',
          },
          withCredentials: true,
        });
        
        // Повторяем исходный запрос с обновленными cookies
        return api.request(error.config);
      } catch {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        // Throw special error to prevent showing error toast
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
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      login: credentials.login,
      password: credentials.password,
      role: credentials.role
    });
    return response.data;
  },

  /**
   * 🍪 Logout - очищает httpOnly cookies на сервере
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      // Очищаем только user из localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
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
  saveTokens: async (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
    console.log('[Auth] Tokens are stored in httpOnly cookies by the server');
    // Ничего не делаем
  },

  /**
   * 🍪 Save user - сохраняем только пользователя в localStorage
   */
  saveUser: async (user: User, rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
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
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await api.get('/auth/profile');
      return true;
    } catch {
      return false;
    }
  },

  // Generic API methods for authenticated requests
  get: (url: string, config?: unknown) => api.get(url, config as Record<string, unknown>),
  post: (url: string, data?: unknown, config?: unknown) => api.post(url, data, config as Record<string, unknown>),
  put: (url: string, data?: unknown, config?: unknown) => api.put(url, data, config as Record<string, unknown>),
  delete: (url: string, config?: unknown) => api.delete(url, config as Record<string, unknown>),
};

// Export the axios instance for direct API calls
export default api;
