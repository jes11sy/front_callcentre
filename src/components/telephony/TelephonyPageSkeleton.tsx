'use client';

import { cn } from '@/lib/utils';
import { useDesignStore } from '@/store/designStore';

// Базовый класс для shimmer эффекта
const shimmerV1 = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";
const shimmerV2 = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-300/50 before:to-transparent";

// Скелетон для фильтров V2
function FiltersSkeletonV2() {
  return (
    <div className="mb-4 sm:mb-6 bg-white dark:bg-[#1e2530] rounded-xl p-3 sm:p-4 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Поиск */}
        <div className={cn("w-full sm:w-48 h-8 sm:h-9 bg-gray-200 dark:bg-gray-700 rounded-md", shimmerV2)}></div>
        
        {/* Разделитель - скрыт на мобильных */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 hidden sm:block"></div>
        
        {/* Фильтры-чипы */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={cn("w-8 sm:w-20 h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full", shimmerV2)}></div>
          <div className={cn("w-8 sm:w-32 h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full", shimmerV2)}></div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для строки таблицы V2
function CallRowSkeletonV2() {
  return (
    <div className="flex items-center py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 dark:border-gray-700 min-w-[700px]">
      {/* Клиент */}
      <div className="w-[18%] pr-2 sm:pr-4">
        <div className={cn("w-20 sm:w-32 h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
      </div>
      
      {/* Источник */}
      <div className="w-[22%] pr-2 sm:pr-4 space-y-1">
        <div className={cn("w-16 sm:w-28 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        <div className={cn("w-12 sm:w-20 h-3 sm:h-4 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
      </div>
      
      {/* Дата и время */}
      <div className="w-[18%] pr-2 sm:pr-4 space-y-1">
        <div className={cn("w-12 sm:w-24 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        <div className={cn("w-10 sm:w-20 h-2 sm:h-3 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
      </div>
      
      {/* Оператор */}
      <div className="w-[20%] pr-2 sm:pr-4 space-y-1">
        <div className={cn("w-16 sm:w-24 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        <div className="flex gap-1">
          <div className={cn("w-10 sm:w-16 h-4 sm:h-5 bg-gray-100 dark:bg-gray-600 rounded-full", shimmerV2)}></div>
          <div className={cn("w-10 sm:w-16 h-4 sm:h-5 bg-gray-100 dark:bg-gray-600 rounded-full", shimmerV2)}></div>
        </div>
      </div>
      
      {/* Действия */}
      <div className="w-[22%] flex justify-end gap-0.5 sm:gap-1">
        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 bg-[#FEC004]/30 rounded", shimmerV2)}></div>
      </div>
    </div>
  );
}

// Скелетон для таблицы V2
function CallTableSkeletonV2() {
  return (
    <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-none overflow-x-auto">
      {/* Заголовок таблицы */}
      <div className="flex items-center py-2 sm:py-3 px-2 sm:px-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-gray-700 min-w-[700px]">
        <div className="w-[18%]">
          <div className={cn("w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        </div>
        <div className="w-[22%]">
          <div className={cn("w-14 sm:w-20 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        </div>
        <div className="w-[18%]">
          <div className={cn("w-10 sm:w-24 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        </div>
        <div className="w-[20%]">
          <div className={cn("w-14 sm:w-20 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded", shimmerV2)}></div>
        </div>
        <div className="w-[22%]"></div>
      </div>
      
      {/* Строки таблицы */}
      <div className="overflow-x-auto">
        {Array.from({ length: 10 }).map((_, index) => (
          <CallRowSkeletonV2 key={index} />
        ))}
      </div>
      
      {/* Пагинация */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border-t border-gray-100 dark:border-gray-700 gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className={cn("w-14 sm:w-16 h-7 sm:h-8 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
          <div className={cn("w-7 h-7 sm:w-8 sm:h-8 bg-[#FEC004]/30 rounded", shimmerV2)}></div>
          <div className={cn("w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-600 rounded", shimmerV2)}></div>
        </div>
      </div>
    </div>
  );
}

// V2 скелетон страницы
function TelephonyPageSkeletonV2() {
  return (
    <div className="w-full py-2 sm:py-4 px-2 sm:px-4 min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
      <FiltersSkeletonV2 />
      <CallTableSkeletonV2 />
    </div>
  );
}

// ============ V1 СКЕЛЕТОНЫ (оригинальные) ============

// Скелетон для заголовка телефонии
function TelephonyHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
      <div className="flex items-center space-x-4">
        {/* Иконка */}
        <div className={cn("w-12 h-12 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        
        {/* Заголовок */}
        <div className="space-y-2">
          <div className={cn("h-6 bg-[#F8F7F9]/20 rounded w-32", shimmerV1)}></div>
          <div className={cn("h-4 bg-[#F8F7F9]/15 rounded w-24", shimmerV1)}></div>
        </div>
      </div>
      
      {/* Кнопки */}
      <div className="flex items-center space-x-3">
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-24 h-10 bg-[#FFD700]/20 rounded-lg", shimmerV1)}></div>
      </div>
    </div>
  );
}

// Скелетон для фильтров
function TelephonyFiltersSkeleton() {
  return (
    <div className="bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] p-6">
      <div className="flex items-center justify-between mb-4">
        {/* Поиск */}
        <div className="flex items-center space-x-4">
          <div className={cn("w-80 h-10 bg-[#F8F7F9]/20 rounded-lg", shimmerV1)}></div>
          <div className={cn("w-24 h-10 bg-[#FFD700]/20 rounded-lg", shimmerV1)}></div>
        </div>
        
        {/* Сортировка и фильтры */}
        <div className="flex items-center space-x-3">
          <div className={cn("w-32 h-10 bg-[#F8F7F9]/20 rounded-lg", shimmerV1)}></div>
          <div className={cn("w-24 h-10 bg-[#F8F7F9]/20 rounded-lg", shimmerV1)}></div>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="flex items-center space-x-6">
        <div className={cn("h-4 bg-[#F8F7F9]/15 rounded w-20", shimmerV1)}></div>
        <div className={cn("h-4 bg-[#F8F7F9]/15 rounded w-16", shimmerV1)}></div>
        <div className={cn("h-4 bg-[#F8F7F9]/15 rounded w-24", shimmerV1)}></div>
      </div>
    </div>
  );
}

// Скелетон для строки таблицы звонков
function CallRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-[#FFD700]/20">
      {/* Чекбокс */}
      <div className={cn("w-4 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
      
      {/* Время */}
      <div className={cn("w-20 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
      
      {/* Номер телефона */}
      <div className={cn("w-32 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
      
      {/* Длительность */}
      <div className={cn("w-16 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
      
      {/* Статус */}
      <div className={cn("w-24 h-6 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
      
      {/* Действия */}
      <div className="flex items-center space-x-2 ml-auto">
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
      </div>
    </div>
  );
}

// Скелетон для таблицы звонков
function CallTableSkeleton() {
  return (
    <div className="bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden">
      {/* Заголовок таблицы */}
      <div className="flex items-center space-x-4 p-4 bg-[#F8F7F9]/10 border-b border-[#FFD700]/20">
        <div className={cn("w-4 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
        <div className={cn("w-20 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
        <div className={cn("w-32 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
        <div className={cn("w-16 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
        <div className={cn("w-24 h-4 bg-[#F8F7F9]/20 rounded", shimmerV1)}></div>
        <div className={cn("w-20 h-4 bg-[#F8F7F9]/20 rounded ml-auto", shimmerV1)}></div>
      </div>
      
      {/* Строки таблицы */}
      <div className="divide-y divide-[#FFD700]/20">
        {Array.from({ length: 8 }).map((_, index) => (
          <CallRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}


// Скелетон для пагинации
function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] p-4">
      {/* Информация о странице */}
      <div className="flex items-center space-x-4">
        <div className={cn("h-4 bg-[#F8F7F9]/20 rounded w-32", shimmerV1)}></div>
      </div>
      
      {/* Кнопки пагинации */}
      <div className="flex items-center space-x-2">
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#FFD700]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
        <div className={cn("w-8 h-8 bg-[#F8F7F9]/20 rounded-full", shimmerV1)}></div>
      </div>
    </div>
  );
}

// V1 скелетон страницы
function TelephonyPageSkeletonV1() {
  return (
    <div className="w-full p-6 space-y-6 bg-[#0f0f23] min-h-screen">
      {/* Header */}
      <TelephonyHeaderSkeleton />
      
      {/* Filters */}
      <TelephonyFiltersSkeleton />
      
      {/* Calls Table */}
      <CallTableSkeleton />
      
      {/* Pagination */}
      <PaginationSkeleton />
    </div>
  );
}

// Основной скелетон страницы телефонии
export function TelephonyPageSkeleton() {
  return <TelephonyPageSkeletonV2 />;
}
