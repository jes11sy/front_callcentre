'use client';

import { useEffect } from 'react';
import { useDesignStore } from '@/store/designStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, _hasHydrated } = useDesignStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme, _hasHydrated]);

  return <>{children}</>;
}
