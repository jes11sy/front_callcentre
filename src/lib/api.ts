/**
 * Единая точка входа для HTTP-клиента.
 * 
 * АРХИТЕКТУРА:
 * - auth.ts    — создаёт axios instance + authApi (login, logout, refresh, getProfile)
 * - api.ts     — реэкспортирует axios instance + authUtils (обратная совместимость)
 * - api-client.ts — типизированные API-методы (ordersApi, callsApi, cashApi)
 * 
 * Для HTTP-запросов используйте:
 *   import api from '@/lib/api'        — axios instance
 *   import { authApi } from '@/lib/auth' — методы авторизации
 *   import { ordersApi } from '@/lib/api-client' — бизнес-методы
 */
import api, { authApi } from '@/lib/auth';
import { authLogger, apiLogger } from '@/lib/logger';

// 🍪 Вспомогательные функции для работы с httpOnly cookies
// Переиспользуем функции из authApi для обратной совместимости
export const authUtils = {
  /**
   * 🍪 Сохранить токены после логина
   * Токены устанавливаются сервером в httpOnly cookies - этот метод не нужен
   */
  setTokens: async (_accessToken: string, _refreshToken: string): Promise<void> => {
    authLogger.log('Tokens are now stored in httpOnly cookies by the server');
  },

  /**
   * 🍪 Получить access токен
   * Нельзя прочитать httpOnly cookies на клиенте
   */
  getAccessToken: async (): Promise<string | null> => {
    authLogger.warn('Cannot read httpOnly cookies on client');
    return null;
  },

  /**
   * 🍪 Получить refresh токен
   * Нельзя прочитать httpOnly cookies на клиенте
   */
  getRefreshToken: async (): Promise<string | null> => {
    authLogger.warn('Cannot read httpOnly cookies on client');
    return null;
  },

  /**
   * 🍪 Проверить наличие токенов через API
   */
  hasTokens: async (): Promise<boolean> => {
    return authApi.isAuthenticated();
  },

  /**
   * 🍪 Очистить токены (logout)
   */
  clearTokens: (): void => {
    authLogger.log('No local tokens to clear - using httpOnly cookies');
  },

  /**
   * 🍪 Logout с вызовом API для очистки cookies
   */
  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      apiLogger.error('Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  },
};

// ✅ FIX: Экспортируем единый axios instance из auth.ts
export default api;

