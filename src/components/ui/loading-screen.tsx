'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

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
  message: _message, 
  fullScreen = true,
  className
}: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = useMemo(() => {
    if (typeof window === 'undefined') return false;

    try {
      const cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]+)/);
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

      if (cookieTheme === 'dark') return true;
      if (cookieTheme === 'light') return false;

      const raw = localStorage.getItem('design-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state ?? parsed;
        if (state?.theme === 'dark') return true;
        if (state?.theme === 'light') return false;
      }
    } catch {
      // ignore and fallback
    }

    return document.documentElement.classList.contains('dark');
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen min-h-[100dvh] bg-[#f5f5f7] dark:bg-[#111113]",
        className
      )} />
    );
  }

  const content = (
    <div 
      className="flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'Myriad Pro', sans-serif" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Image
          src={isDarkTheme ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"}
          alt="Logo"
          width={200}
          height={50}
          className="h-12 w-auto"
        />
      </div>

      {/* Spinner */}
      <div className={`h-12 w-12 animate-spin rounded-full border-b-2 ${isDarkTheme ? 'border-white' : 'border-[#FEC004]'}`} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn(
        `min-h-screen min-h-[100dvh] flex items-center justify-center transition-colors duration-300 ${isDarkTheme ? 'bg-[#111113]' : 'bg-[#f5f5f7]'}`,
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(`flex items-center justify-center py-12 transition-colors duration-300 ${isDarkTheme ? 'bg-[#111113]' : 'bg-[#f5f5f7]'}`, className)}>
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
      <div className={cn(
        "absolute top-0 left-0 rounded-full border-2 border-transparent animate-spin border-b-[#FEC004] dark:border-b-white",
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
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
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
        <div className={cn(
          "absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#F3F3EE]/80 dark:bg-[#111827]/80"
        )}>
          <LoadingState message={message} />
        </div>
      )}
    </div>
  );
}
