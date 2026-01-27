/**
 * ✅ FIX: Объединенный API модуль - переиспользует axios instance из auth.ts
 * Это устраняет дублирование axios instances и обеспечивает единую конфигурацию
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

