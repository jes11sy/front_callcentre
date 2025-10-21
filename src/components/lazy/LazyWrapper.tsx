// Универсальная система ленивой загрузки с умными fallback'ами
// Поддерживает различные типы загрузки и состояния

import { Suspense, ReactNode, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

// Типы fallback компонентов
interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackType?: 'spinner' | 'skeleton' | 'placeholder' | 'custom';
  height?: string | number;
  width?: string | number;
  className?: string;
  errorBoundary?: boolean;
}

// Компоненты fallback'ов
const SpinnerFallback = ({ height = '200px' }: { height?: string | number }) => (
  <div 
    className="flex items-center justify-center bg-[#F8F7F9]/10 rounded-lg chart-container"
    style={{ '--chart-height': `${height}px` } as React.CSSProperties}
  >
    <LoadingSpinner />
  </div>
);

const SkeletonFallback = ({ height = '200px' }: { height?: string | number }) => (
  <div 
    className="animate-pulse bg-[#17212b] rounded-lg border border-[#FFD700]/20 chart-container"
    style={{ '--chart-height': `${height}px` } as React.CSSProperties}
  >
    <div className="space-y-3 p-4">
      <div className="h-4 bg-[#F8F7F9]/20 rounded w-3/4"></div>
      <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/2"></div>
      <div className="h-4 bg-[#F8F7F9]/20 rounded w-5/6"></div>
    </div>
  </div>
);

const PlaceholderFallback = ({ height = '200px' }: { height?: string | number }) => (
  <div 
    className="flex items-center justify-center bg-gradient-to-br from-[#F8F7F9]/10 to-[#9EA93F]/10 rounded-lg border-2 border-dashed border-[#F8F7F9]/30 chart-container"
    style={{ '--chart-height': `${height}px` } as React.CSSProperties}
  >
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-2 bg-[#F8F7F9]/20 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-[#F8F7F9]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-sm text-[#F8F7F9]/60">Загрузка...</p>
    </div>
  </div>
);

// Основной LazyWrapper
export function LazyWrapper({ 
  children, 
  fallback, 
  fallbackType = 'spinner',
  height = '200px',
  width,
  className = '',
  errorBoundary: _errorBoundary = true
}: LazyWrapperProps) {
  const getFallback = () => {
    if (fallback) return fallback;
    
    const style = { height, width };
    
    switch (fallbackType) {
      case 'skeleton':
        return <SkeletonFallback height={height} />;
      case 'placeholder':
        return <PlaceholderFallback height={height} />;
      case 'custom':
        return <div className="flex items-center justify-center" style={style}>Загрузка...</div>;
      default:
        return <SpinnerFallback height={height} />;
    }
  };

  return (
    <div className={className} style={{ width }}>
      <Suspense fallback={getFallback()}>
        {children}
      </Suspense>
    </div>
  );
}

// Специализированные обертки для разных типов компонентов
export function ModalLazyWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="skeleton" 
      height="400px"
      className="w-full max-w-2xl mx-auto"
    >
      {children}
    </LazyWrapper>
  );
}

export function PageLazyWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="skeleton" 
      height="600px"
      className="w-full"
    >
      {children}
    </LazyWrapper>
  );
}

export function TableLazyWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="skeleton" 
      height="400px"
      className="w-full"
    >
      {children}
    </LazyWrapper>
  );
}

export function ChartLazyWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="placeholder" 
      height="300px"
      className="w-full"
    >
      {children}
    </LazyWrapper>
  );
}

export function ListLazyWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="spinner"
      height="400px"
      className="w-full"
    >
      {children}
    </LazyWrapper>
  );
}

// HOC для ленивой загрузки компонентов
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallbackType: LazyWrapperProps['fallbackType'] = 'spinner',
  height: string | number = '200px'
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyWrapper fallbackType={fallbackType} height={height}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

// Хук для предзагрузки компонентов
export function usePreloadComponent(importFn: () => Promise<unknown>) {
  const preload = () => {
    importFn().catch(console.error);
  };
  
  return preload;
}

export function MessageListWrapper({ children }: { children: ReactNode }) {
  return (
    <LazyWrapper 
      fallbackType="spinner"
      height="400px"
      className="w-full"
    >
      {children}
    </LazyWrapper>
  );
}

// Алиасы для обратной совместимости
export const ChatListWrapper = ListLazyWrapper;
