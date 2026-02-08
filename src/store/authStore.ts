import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/auth';

/**
 * БЕЗОПАСНОСТЬ: Определяем какие поля пользователя безопасно хранить
 * Чувствительные данные (токены, пароли) НИКОГДА не должны храниться в storage!
 * Аутентификация основана на httpOnly cookies, а не на localStorage.
 */
interface SafeUserData {
  id: number;
  login: string;
  name: string;
  role: string;
  cities?: string[];
}

/**
 * Извлекает только безопасные для хранения данные пользователя
 * Исключает любые токены, секреты и чувствительные данные
 */
function sanitizeUserForStorage(user: User | null): SafeUserData | null {
  if (!user) return null;
  
  // Сохраняем только необходимые для UI данные
  return {
    id: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
    cities: user.cities,
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Начальные значения - одинаковые на сервере и клиенте
      user: null,
      isAuthenticated: false,
      isLoading: false, // НЕ true! Иначе бесконечный loading
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
        
      setHasHydrated: (state) =>
        set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только безопасные данные
      partialize: (state) => ({
        user: sanitizeUserForStorage(state.user),
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Вызывается после восстановления данных из localStorage
        state?.setHasHydrated(true);
      },
    }
  )
);
