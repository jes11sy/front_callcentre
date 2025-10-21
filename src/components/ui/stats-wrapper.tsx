// Обертка для статистических карточек с ленивой загрузкой
// Предоставляет единый интерфейс для всех типов статистики

'use client';

import { Suspense, useMemo } from 'react';
import { LazyWrapper } from '@/components/lazy/LazyWrapper';
import React from 'react';

interface StatsWrapperProps {
  children: React.ReactNode;
  type?: 'grid' | 'dashboard' | 'panel' | 'card';
  columns?: number;
  height?: number;
}

const StatsWrapperComponent = ({ 
  children, 
  type: _type = 'grid',
  columns = 4,
  height = 200
}: StatsWrapperProps) => {
  // Мемоизированная функция для получения CSS классов
  const gridClass = useMemo(() => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  }, [columns]);

  return (
    <LazyWrapper fallbackType="skeleton" height={height}>
      <div className={`grid ${gridClass} gap-6`}>
        <Suspense fallback={
          Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#F8F7F9]/20 rounded-lg p-6">
                <div className="h-4 bg-[#F8F7F9]/30 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-[#F8F7F9]/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#F8F7F9]/30 rounded w-1/3"></div>
              </div>
            </div>
          ))
        }>
          {children}
        </Suspense>
      </div>
    </LazyWrapper>
  );
};

StatsWrapperComponent.displayName = 'StatsWrapper';

export const StatsWrapper = React.memo(StatsWrapperComponent);
