// Оптимизированная конфигурация React Query
// Уменьшает bundle size и улучшает производительность

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Оптимизированная конфигурация QueryClient
export const createOptimizedQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Уменьшаем количество повторных запросов
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (заменяет cacheTime)
      retry: (failureCount, error) => {
        // Не повторяем запросы для 4xx ошибок
        if (error && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Оптимизированный провайдер с ленивой загрузкой DevTools
export function OptimizedQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createOptimizedQueryClient());
  const [_showDevtools, _setShowDevtools] = useState(false);

  // DevTools отключены для уменьшения bundle size
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     const loadDevtools = async () => {
  //       try {
  //         await import('@tanstack/react-query-devtools');
  //         setShowDevtools(true);
  //       } catch (error) {
  //         console.warn('Failed to load React Query DevTools:', error);
  //       }
  //     };
  //     
  //     loadDevtools();
  //   }
  // }, []);

  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// Оптимизированные хуки для часто используемых запросов
export const queryKeys = {
  // Кеш ключи для лучшего tree shaking
  auth: ['auth'] as const,
  user: ['user'] as const,
  orders: ['orders'] as const,
  calls: ['calls'] as const,
  messages: ['messages'] as const,
  stats: ['stats'] as const,
  avito: ['avito'] as const,
  employees: ['employees'] as const,
} as const;

// Утилиты для создания кеш ключей
export const createQueryKey = (baseKey: string, params?: Record<string, unknown>) => {
  if (!params) return [baseKey];
  return [baseKey, params];
};

// Оптимизированные настройки для разных типов данных
export const queryConfigs = {
  // Для статичных данных (справочники, настройки)
  static: {
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
  },
  // Для часто изменяющихся данных (звонки, сообщения)
  dynamic: {
    staleTime: 30 * 1000, // 30 секунд
    gcTime: 5 * 60 * 1000, // 5 минут
  },
  // Для пользовательских данных
  user: {
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 15 * 60 * 1000, // 15 минут
  },
} as const;
