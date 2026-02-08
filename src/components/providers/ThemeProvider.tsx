'use client';

import { useEffect } from 'react';
import { useDesignStore } from '@/store/designStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useDesignStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
