'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface DesignState {
  theme: ThemeMode;
  _hasHydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      _hasHydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'design-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Хук для безопасного использования designStore с SSR
 * Возвращает дефолтные значения до гидратации, чтобы избежать ошибки React #418
 */
export function useDesignStoreHydrated(): DesignState & { isHydrated: boolean } {
  const store = useDesignStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // До гидратации возвращаем дефолтные значения для SSR
  const theme: ThemeMode = isHydrated ? store.theme : 'light';
  
  return {
    ...store,
    theme,
    isHydrated,
  };
}
