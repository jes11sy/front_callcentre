'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDesignStoreHydrated } from '@/store/designStore';

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
 * Поддерживает светлую и тёмную тему
 */
export function LoadingScreen({ 
  message, 
  fullScreen = true,
  className
}: LoadingScreenProps) {
  const { theme, isHydrated } = useDesignStoreHydrated();
  
  // До гидратации - показываем светлую тему
  const effectiveTheme = isHydrated ? theme : 'light';
  const isDark = effectiveTheme === 'dark';
  const bgColor = isDark ? 'bg-[#111827]' : 'bg-[#F3F3EE]';
  
  const content = (
    <div 
      className="flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'Myriad Pro', sans-serif" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Image 
          src={isDark ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"} 
          alt="Logo" 
          width={200} 
          height={50} 
          className="h-12 w-auto" 
        />
      </div>

      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="w-full h-full rounded-full border-4 border-[#FEC004]/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FEC004] animate-spin" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn(
        "min-h-screen min-h-[100dvh] flex items-center justify-center transition-colors duration-300",
        bgColor,
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12 transition-colors duration-300", bgColor, className)}>
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
      <div className={cn(sizeClasses[size], "rounded-full border-2 border-[#FEC004]/20")} />
      <div className={cn(
        "absolute top-0 left-0 rounded-full border-2 border-transparent animate-spin border-t-[#FEC004]",
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
  const { theme, isHydrated } = useDesignStoreHydrated();
  const isDark = isHydrated ? theme === 'dark' : false;
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 space-y-3",
      className
    )}>
      <LoadingSpinner size={size} />
      <p className={cn(
        "text-sm", 
        isDark ? 'text-gray-400' : 'text-gray-600'
      )}>{message}</p>
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
  const { theme, isHydrated } = useDesignStoreHydrated();
  const isDark = isHydrated ? theme === 'dark' : false;
  
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50",
          isDark ? 'bg-[#111827]/80' : 'bg-[#F3F3EE]/80'
        )}>
          <LoadingState message={message} />
        </div>
      )}
    </div>
  );
}
