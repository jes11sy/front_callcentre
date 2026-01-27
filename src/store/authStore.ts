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
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

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
    }),
    {
      name: 'auth-storage',
      // БЕЗОПАСНОСТЬ: Используем sessionStorage вместо localStorage
      // sessionStorage очищается при закрытии браузера
      storage: createJSONStorage(() => sessionStorage),
      // БЕЗОПАСНОСТЬ: Сохраняем только безопасные данные
      partialize: (state) => ({
        // Сохраняем только минимальные данные для UI, без чувствительной информации
        user: sanitizeUserForStorage(state.user),
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
