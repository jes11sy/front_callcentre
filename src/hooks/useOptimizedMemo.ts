// Оптимизированные хуки для мемоизации
// Предотвращают ненужные ре-рендеры и вычисления

import { useMemo, useRef, useEffect } from 'react';

// Хук для глубокой мемоизации объектов
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);
  
  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }
  
  return ref.current.value;
}

// Хук для мемоизации функций с зависимостями
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ callback: T; deps: React.DependencyList } | undefined>(undefined);
  
  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = {
      callback,
      deps: [...deps]
    };
  }
  
  return ref.current.callback;
}

// Хук для мемоизации с кэшированием по ключу
export function useKeyedMemo<T>(
  key: string | number,
  factory: () => T,
  deps: React.DependencyList
): T {
  const cacheRef = useRef<Map<string | number, T>>(new Map());
  const depsRef = useRef<React.DependencyList>([]);
  
  if (!cacheRef.current.has(key) || !areEqual(depsRef.current, deps)) {
    cacheRef.current.set(key, factory());
    depsRef.current = [...deps];
  }
  
  return cacheRef.current.get(key)!;
}

// Хук для мемоизации с TTL (время жизни)
export function useTTLMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 5000 // 5 секунд по умолчанию
): T {
  const ref = useRef<{
    value: T;
    deps: React.DependencyList;
    timestamp: number;
  } | undefined>(undefined);
  
  const now = Date.now();
  
  if (
    !ref.current ||
    !areEqual(ref.current.deps, deps) ||
    now - ref.current.timestamp > ttl
  ) {
    ref.current = {
      value: factory(),
      deps: [...deps],
      timestamp: now
    };
  }
  
  return ref.current.value;
}

// Хук для мемоизации с условием
export function useConditionalMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  condition: boolean
): T | undefined {
  return useMemo(() => {
    if (condition) {
      return factory();
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition, factory, ...deps]);
}

// Утилита для сравнения массивов зависимостей
function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

// Хук для мемоизации с очисткой кэша
export function useMemoWithCleanup<T>(
  factory: () => T,
  deps: React.DependencyList,
  cleanup?: (value: T) => void
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => factory(), deps);
  
  useEffect(() => {
    return () => {
      if (cleanup) {
        cleanup(value);
      }
    };
  }, [value, cleanup]);
  
  return value;
}
