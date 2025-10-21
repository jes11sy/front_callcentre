// Обертка для таблиц данных с ленивой загрузкой
// Предоставляет единый интерфейс для всех типов таблиц

'use client';

import { Suspense } from 'react';
import { TableLazyWrapper } from '@/components/lazy/LazyWrapper';

interface TableWrapperProps {
  children: React.ReactNode;
  type?: 'basic' | 'sortable' | 'filterable' | 'virtualized';
  height?: number;
  loading?: boolean;
}

export function TableWrapper({ 
  children, 
  type: _type = 'basic',
  height: _height = 400,
  loading = false
}: TableWrapperProps) {
  if (loading) {
    return (
      <TableLazyWrapper>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </TableLazyWrapper>
    );
  }

  return (
    <TableLazyWrapper>
      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      }>
        {children}
      </Suspense>
    </TableLazyWrapper>
  );
}
