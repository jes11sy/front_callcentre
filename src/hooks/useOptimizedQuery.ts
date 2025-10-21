import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, useEffect } from 'react';

interface OptimizedQueryOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: number;
}

// Оптимизированный хук для запросов с умным кэшированием
export const useOptimizedQuery = <T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions = {}
) => {
  const queryClient = useQueryClient();

  const defaultOptions = useMemo(() => ({
    staleTime: 2 * 60 * 1000, // 2 минуты
    cacheTime: 5 * 60 * 1000, // 5 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    ...options
  }), [options]);

  const query = useQuery({
    queryKey,
    queryFn,
    ...defaultOptions
  });

  // Функция для принудительного обновления
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Функция для предварительной загрузки данных
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...defaultOptions
    });
  }, [queryClient, queryKey, queryFn, defaultOptions]);

  return {
    ...query,
    invalidate,
    prefetch
  };
};

// Хук для оптимизированной пагинации
export const useOptimizedPagination = <T>(
  queryKey: (string | number)[],
  queryFn: (page: number, limit: number) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>,
  initialPage: number = 1,
  initialLimit: number = 20
) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const query = useOptimizedQuery(
    [...queryKey, page, limit],
    () => queryFn(page, limit),
    {
      staleTime: 1 * 60 * 1000 // 1 минута для пагинированных данных
    }
  );

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Сбрасываем на первую страницу при изменении лимита
  }, []);

  // Извлекаем сложные выражения в отдельные переменные
  const hasNext = (query.data as { pagination?: { hasNext?: boolean } })?.pagination?.hasNext;
  const hasPrev = (query.data as { pagination?: { hasPrev?: boolean } })?.pagination?.hasPrev;

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  return {
    ...query,
    page,
    limit,
    goToPage,
    changeLimit,
    nextPage,
    prevPage,
    pagination: (query.data as { pagination?: unknown })?.pagination
  };
};

// Хук для дебаунсинга поиска
export const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return debouncedSearchTerm;
};

// Хук для виртуализации списков
export const useVirtualization = (
  items: unknown[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll
  };
};

// Хук для оптимизированного мемоизирования
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(), deps);
};

// Хук для ленивой загрузки компонентов
export const useLazyComponent = (importFn: () => Promise<unknown>) => {
  const [Component, setComponent] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const loadComponent = useCallback(async () => {
    if (Component || loading) return;

    setLoading(true);
    try {
      const importedModule = await importFn();
      setComponent(() => (importedModule as { default: unknown }).default);
    } catch (error) {
      console.error('Failed to load component:', error);
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFn]);

  return {
    Component,
    loading,
    loadComponent
  };
};
