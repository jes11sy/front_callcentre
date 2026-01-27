/**
 * ✅ FIX #151: Утилиты для retry логики с axios
 * Добавлен retry logic для frontend callcentre
 */

import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: boolean;
  retryOnStatus?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: true,
  retryOnStatus: [502, 503, 504, 0], // 0 - сетевые ошибки
};

/**
 * Расширяем конфигурацию запроса для хранения retry count
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
  __retryConfig?: RetryConfig;
}

/**
 * Настраивает axios instance для автоматических повторных попыток
 */
export function setupAxiosRetry(axiosInstance: AxiosInstance, config?: RetryConfig) {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableRequestConfig | undefined;
      
      if (!config) {
        return Promise.reject(error);
      }

      // Инициализируем счетчик повторов
      config.__retryCount = config.__retryCount ?? 0;
      config.__retryConfig = config.__retryConfig ?? retryConfig;
      
      const { maxRetries, retryDelay, backoff, retryOnStatus } = config.__retryConfig;

      // Определяем статус код (0 для сетевых ошибок)
      const statusCode = error.response?.status ?? 0;
      
      // Проверяем, нужно ли повторять запрос
      const shouldRetry = 
        config.__retryCount < maxRetries &&
        retryOnStatus.includes(statusCode);

      if (!shouldRetry) {
        return Promise.reject(error);
      }

      config.__retryCount += 1;

      // Вычисляем задержку
      const delay = backoff
        ? retryDelay * Math.pow(2, config.__retryCount - 1)
        : retryDelay;

      // Логируем в development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `🔄 Axios retry ${config.__retryCount}/${maxRetries} ` +
          `for ${config.url} after ${delay}ms (status: ${statusCode})`
        );
      }

      // Ждем перед повтором
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Повторяем запрос
      return axiosInstance.request(config);
    }
  );
}

/**
 * Классификация сетевых ошибок для axios
 */
export type NetworkErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'CLIENT_ERROR'
  | 'UNKNOWN';

export function classifyAxiosError(error: AxiosError): {
  type: NetworkErrorType;
  message: string;
  retryable: boolean;
} {
  // Нет ответа от сервера (сетевая ошибка)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: 'TIMEOUT',
        message: 'Превышено время ожидания. Попробуйте еще раз.',
        retryable: true,
      };
    }
    
    return {
      type: 'NETWORK_ERROR',
      message: 'Нет подключения к интернету. Проверьте соединение.',
      retryable: true,
    };
  }

  const status = error.response.status;

  // 5xx ошибки сервера
  if (status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: `Ошибка сервера (${status}). Попробуйте позже.`,
      retryable: status === 502 || status === 503 || status === 504,
    };
  }

  // 4xx ошибки клиента
  if (status >= 400) {
    return {
      type: 'CLIENT_ERROR',
      message: (error.response.data as any)?.message || `Ошибка запроса (${status})`,
      retryable: false,
    };
  }

  return {
    type: 'UNKNOWN',
    message: error.message || 'Произошла неизвестная ошибка',
    retryable: false,
  };
}

/**
 * Получить читаемое сообщение об ошибке
 */
export function getUserFriendlyAxiosError(error: AxiosError): string {
  const classified = classifyAxiosError(error);
  
  switch (classified.type) {
    case 'NETWORK_ERROR':
      return '❌ Нет подключения к интернету. Проверьте сеть и попробуйте снова.';
    case 'TIMEOUT':
      return '⏱️ Превышено время ожидания. Сервер не отвечает. Попробуйте позже.';
    case 'SERVER_ERROR':
      return '🔧 Ошибка на сервере. Мы уже работаем над устранением проблемы.';
    case 'CLIENT_ERROR':
      return classified.message;
    default:
      return classified.message || 'Произошла ошибка. Попробуйте еще раз.';
  }
}
