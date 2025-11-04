import axios from 'axios';
import { tokenStorage } from './secure-storage';

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
    accessToken: string;
    refreshToken: string;
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

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only handle 401 errors for authenticated requests, not login requests
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/refresh')) {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          const rememberMe = await tokenStorage.getRememberMe();
          
          await tokenStorage.setAccessToken(accessToken, rememberMe);
          if (newRefreshToken) {
            await tokenStorage.setRefreshToken(newRefreshToken, rememberMe);
          }
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch {
          // Refresh failed, clear all tokens and redirect to login
          await tokenStorage.clearAll();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          // Throw special error to prevent showing error toast
          const sessionError = new Error('SESSION_EXPIRED');
          (sessionError as any).isSessionExpired = true;
          return Promise.reject(sessionError);
        }
      } else {
        // No refresh token, clear all tokens and redirect to login
        await tokenStorage.clearAll();
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

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', {
      login: credentials.login,
      password: credentials.password,
      role: credentials.role
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await tokenStorage.clearAll();
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Storage helpers
  saveTokens: async (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
    await tokenStorage.setAccessToken(accessToken, rememberMe);
    await tokenStorage.setRefreshToken(refreshToken, rememberMe);
    await tokenStorage.setRememberMe(rememberMe);
  },

  saveUser: async (user: User, rememberMe: boolean = false) => {
    await tokenStorage.setUser(user, rememberMe);
  },

  getUser: async (): Promise<User | null> => {
    return (await tokenStorage.getUser()) as User | null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    return await tokenStorage.isAuthenticated();
  },

  // Generic API methods for authenticated requests
  get: (url: string, config?: unknown) => api.get(url, config as Record<string, unknown>),
  post: (url: string, data?: unknown, config?: unknown) => api.post(url, data, config as Record<string, unknown>),
  put: (url: string, data?: unknown, config?: unknown) => api.put(url, data, config as Record<string, unknown>),
  delete: (url: string, config?: unknown) => api.delete(url, config as Record<string, unknown>),
};

// Export the axios instance for direct API calls
export default api;
