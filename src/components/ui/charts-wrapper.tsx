// Обертка для графиков с ленивой загрузкой
// Предоставляет единый интерфейс для всех типов графиков

'use client';

import { Suspense } from 'react';
import { ChartLazyWrapper } from '@/components/lazy/LazyWrapper';

interface ChartsWrapperProps {
  children: React.ReactNode;
  type?: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  width?: number;
}

export function ChartsWrapper({ 
  children, 
  type: _type = 'line',
  height = 300,
  width = 400
}: ChartsWrapperProps) {
  return (
    <ChartLazyWrapper>
      <div className="chart-container" style={{ '--chart-height': `${height}px`, '--chart-width': width } as React.CSSProperties}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-[#F8F7F9]/10 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#F8F7F9]/30 border-t-[#9EA93F] rounded-full animate-spin"></div>
              <p className="text-sm text-[#F8F7F9]/60">Загрузка графика...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </ChartLazyWrapper>
  );
}
