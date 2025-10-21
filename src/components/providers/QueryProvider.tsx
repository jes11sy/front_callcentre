'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут - увеличиваем время кэширования
            gcTime: 10 * 60 * 1000, // 10 минут - данные остаются в кэше дольше
            retry: (failureCount, error: unknown) => {
              // Умная логика повторов
              if ((error as { status?: number }).status === 404) return false; // Не повторяем для 404
              if ((error as { status?: number }).status === 401) return false; // Не повторяем для 401
              return failureCount < 2; // Максимум 2 повтора
            },
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Не обновляем при монтировании если данные свежие
            refetchOnReconnect: true, // Обновляем при восстановлении соединения
          },
          mutations: {
            retry: 1, // Один повтор для мутаций
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
