'use client';

import { cn } from '@/lib/utils';

// Скелетон для заголовка телефонии
function TelephonyHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
      <div className="flex items-center space-x-4">
        {/* Иконка */}
        <div className={cn(
          "w-12 h-12 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        
        {/* Заголовок */}
        <div className="space-y-2">
          <div className={cn(
            "h-6 bg-[#F8F7F9]/20 rounded w-32",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
          <div className={cn(
            "h-4 bg-[#F8F7F9]/15 rounded w-24",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
        </div>
      </div>
      
      {/* Кнопки */}
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-24 h-10 bg-[#FFD700]/20 rounded-lg",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
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
          <div className={cn(
            "w-80 h-10 bg-[#F8F7F9]/20 rounded-lg",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
          <div className={cn(
            "w-24 h-10 bg-[#FFD700]/20 rounded-lg",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
        </div>
        
        {/* Сортировка и фильтры */}
        <div className="flex items-center space-x-3">
          <div className={cn(
            "w-32 h-10 bg-[#F8F7F9]/20 rounded-lg",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
          <div className={cn(
            "w-24 h-10 bg-[#F8F7F9]/20 rounded-lg",
            "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          )}></div>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="flex items-center space-x-6">
        <div className={cn(
          "h-4 bg-[#F8F7F9]/15 rounded w-20",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "h-4 bg-[#F8F7F9]/15 rounded w-16",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "h-4 bg-[#F8F7F9]/15 rounded w-24",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
      </div>
    </div>
  );
}

// Скелетон для строки таблицы звонков
function CallRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-[#FFD700]/20">
      {/* Чекбокс */}
      <div className={cn(
        "w-4 h-4 bg-[#F8F7F9]/20 rounded",
        "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      )}></div>
      
      {/* Время */}
      <div className={cn(
        "w-20 h-4 bg-[#F8F7F9]/20 rounded",
        "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      )}></div>
      
      {/* Номер телефона */}
      <div className={cn(
        "w-32 h-4 bg-[#F8F7F9]/20 rounded",
        "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      )}></div>
      
      {/* Длительность */}
      <div className={cn(
        "w-16 h-4 bg-[#F8F7F9]/20 rounded",
        "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      )}></div>
      
      {/* Статус */}
      <div className={cn(
        "w-24 h-6 bg-[#F8F7F9]/20 rounded-full",
        "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
      )}></div>
      
      {/* Действия */}
      <div className="flex items-center space-x-2 ml-auto">
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
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
        <div className={cn(
          "w-4 h-4 bg-[#F8F7F9]/20 rounded",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-20 h-4 bg-[#F8F7F9]/20 rounded",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-32 h-4 bg-[#F8F7F9]/20 rounded",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-16 h-4 bg-[#F8F7F9]/20 rounded",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-24 h-4 bg-[#F8F7F9]/20 rounded",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-20 h-4 bg-[#F8F7F9]/20 rounded ml-auto",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
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
        <div className={cn(
          "h-4 bg-[#F8F7F9]/20 rounded w-32",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
      </div>
      
      {/* Кнопки пагинации */}
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#FFD700]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
        )}></div>
      </div>
    </div>
  );
}

// Основной скелетон страницы телефонии
export function TelephonyPageSkeleton() {
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
