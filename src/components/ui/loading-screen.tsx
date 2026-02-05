'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDesignStore } from '@/store/designStore';

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
 * Поддерживает V1 и V2 дизайн
 */
export function LoadingScreen({ 
  message, 
  fullScreen = true,
  className
}: LoadingScreenProps) {
  const { version } = useDesignStore();

  // ============ V2 DESIGN ============
  if (version === 'v2') {
    const contentV2 = (
      <div 
        className="flex flex-col items-center justify-center px-4"
        style={{ fontFamily: "'Myriad Pro', sans-serif" }}
      >
        {/* Logo V2 */}
        <div className="mb-8">
          <Image src="/logo_v2.png" alt="Logo" width={200} height={50} className="h-12 w-auto" />
        </div>

        {/* Spinner V2 */}
        <div className="relative mb-6 w-12 h-12">
          <div className="w-full h-full rounded-full border-4 border-[#FEC004]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FEC004] animate-spin" />
        </div>

        {/* Text */}
        {message && (
          <div className="text-gray-600 text-base font-medium text-center">
            {message}
          </div>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className={cn(
          "min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#F3F3EE]",
          className
        )}>
          {contentV2}
        </div>
      );
    }

    return (
      <div className={cn("flex items-center justify-center py-12 bg-[#F3F3EE]", className)}>
        {contentV2}
      </div>
    );
  }

  // ============ V1 DESIGN ============
  const contentV1 = (
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
        {message || 'Загрузка...'}
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
        {contentV1}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      {contentV1}
    </div>
  );
}

/**
 * Минимальный спиннер для использования внутри компонентов
 * Поддерживает V1 и V2 дизайн
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { version } = useDesignStore();
  
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const borderColor = version === 'v2' ? 'border-[#FEC004]' : 'border-[#FFD700]';
  const borderBgColor = version === 'v2' ? 'border-[#FEC004]/20' : 'border-[#FFD700]/20';

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className={cn(sizeClasses[size], "rounded-full border-2", borderBgColor)} />
      <div className={cn(
        "absolute top-0 left-0 rounded-full border-2 border-transparent animate-spin",
        version === 'v2' ? 'border-t-[#FEC004]' : 'border-t-[#FFD700] border-r-[#FFA500]/50',
        sizeClasses[size]
      )} />
    </div>
  );
}

/**
 * Состояние загрузки для контента (таблицы, списки и т.д.)
 * Поддерживает V1 и V2 дизайн
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
  const { version } = useDesignStore();
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 space-y-3",
      className
    )}>
      <LoadingSpinner size={size} />
      <p className={cn("text-sm", version === 'v2' ? 'text-gray-600' : 'text-[#9CA3AF]')}>{message}</p>
    </div>
  );
}

/**
 * Оверлей загрузки поверх контента
 * Поддерживает V1 и V2 дизайн
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
  const { version } = useDesignStore();
  
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50",
          version === 'v2' ? 'bg-[#F3F3EE]/80' : 'bg-[#02111B]/80'
        )}>
          <LoadingState message={message} />
        </div>
      )}
    </div>
  );
}
