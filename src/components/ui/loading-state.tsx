import React from 'react';
import Image from 'next/image';

interface LoadingStateProps {
  isDark: boolean;
  message?: string;
  fullPage?: boolean;
}

const resolveDarkLoadingTheme = (fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
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
    // ignore parse/cookie errors
  }

  return document.documentElement.classList.contains('dark') || fallback;
};

export function LoadingState({
  isDark,
  message: _message = 'Загрузка...',
  fullPage = false
}: LoadingStateProps) {
  const effectiveIsDark = resolveDarkLoadingTheme(isDark);

  return (
    <div className={`${fullPage ? 'min-h-[70vh] flex items-center justify-center' : 'py-10'} text-center animate-fade-in`}>
      <div>
      <div className="mb-6 flex justify-center">
        <Image
          src={effectiveIsDark ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"}
          alt="Logo"
          width={240}
          height={60}
          className="h-[52px] w-auto object-contain opacity-95"
          priority
        />
      </div>

      <div
        className={`mx-auto h-12 w-12 animate-spin rounded-full border-2 border-transparent ${
          effectiveIsDark ? 'border-b-white' : 'border-b-[#0a4f42]'
        }`}
      />
      </div>
    </div>
  );
}
