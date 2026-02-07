'use client';

import { useEffect } from 'react';
import { useDesignStore } from '@/store/designStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, version } = useDesignStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Тёмная тема только для V2
    if (version === 'v2' && theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, version]);

  return <>{children}</>;
}
