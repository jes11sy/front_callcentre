// Обертка для ленивых компонентов с Suspense
import { Suspense, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// Специализированные обертки для разных компонентов
export function MessageListWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper fallback={
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#F8F7F9]/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4" />
                <div className="h-16 bg-[#F8F7F9]/20 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    }>
      {children}
    </LazyWrapper>
  );
}

export function ChatListWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper fallback={
      <div className="p-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-[#F8F7F9]/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-3/4" />
                <div className="h-3 bg-[#F8F7F9]/20 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    }>
      {children}
    </LazyWrapper>
  );
}
