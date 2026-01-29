'use client';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  /** Текст под спиннером */
  message?: string;
  /** Полноэкранный режим */
  fullScreen?: boolean;
  /** Дополнительные классы */
  className?: string;
}

/**
 * Единый компонент загрузки для всего приложения
 * Используется на:
 * - AuthProvider (проверка сессии)
 * - Suspense fallback
 * - Любые полноэкранные загрузки
 */
export function LoadingScreen({ 
  message = 'Загрузка...', 
  fullScreen = true,
  className
}: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Логотип/Название */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
          Lead Schem
        </h1>
      </div>

      {/* Спиннер */}
      <div className="relative mb-6 w-14 h-14">
        {/* Внешнее кольцо */}
        <div className="w-full h-full rounded-full border-4 border-[#FFD700]/20" />
        
        {/* Вращающееся кольцо */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent 
                        border-t-[#FFD700] border-r-[#FFA500]/50 animate-spin" />
        
        {/* Внутреннее кольцо (вращается в другую сторону) */}
        <div className="absolute top-2 left-2 w-10 h-10 rounded-full 
                        border-4 border-transparent border-b-[#FFD700]/70 border-l-[#FFA500]/30 animate-spin"
             style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>

      {/* Текст загрузки */}
      <div className="text-[#F8F7F9] text-lg font-medium text-center">
        {message}
      </div>
      
      {/* Прогресс-бар */}
      <div className="mt-6 w-48 h-1 bg-[#FFD700]/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full animate-loading-bar" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn(
        "min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#02111B]",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      {content}
    </div>
  );
}

/**
 * Минимальный спиннер для использования внутри компонентов
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className={cn(sizeClasses[size], "rounded-full border-2 border-[#FFD700]/20")} />
      <div className={cn(
        "absolute top-0 left-0 rounded-full border-2 border-transparent",
        "border-t-[#FFD700] border-r-[#FFA500]/50 animate-spin",
        sizeClasses[size]
      )} />
    </div>
  );
}

/**
 * Состояние загрузки для контента (таблицы, списки и т.д.)
 */
export function LoadingState({ 
  message = 'Загрузка...', 
  size = 'md',
  className 
}: { 
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 space-y-3",
      className
    )}>
      <LoadingSpinner size={size} />
      <p className="text-sm text-[#9CA3AF]">{message}</p>
    </div>
  );
}

/**
 * Оверлей загрузки поверх контента
 */
export function LoadingOverlay({ 
  isLoading, 
  message, 
  children 
}: { 
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-[#02111B]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingState message={message} />
        </div>
      )}
    </div>
  );
}
