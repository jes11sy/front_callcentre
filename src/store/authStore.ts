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

// ВАЖНО: НЕ читаем из localStorage при инициализации store!
// Это вызывает ошибку гидратации React #418, т.к. на сервере user=null,
// а на клиенте user может быть из localStorage.
// Zustand persist сам восстановит данные после гидратации через onRehydrateStorage.
const initialUser: User | null = null;

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
      // Начинаем с null - данные восстановятся из localStorage после гидратации
      user: initialUser,
      isAuthenticated: false,
      // Показываем loading пока не произойдёт гидратация
      isLoading: true,
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
      // ✅ PWA FIX: Используем localStorage вместо sessionStorage
      // sessionStorage очищается в iOS PWA между запусками
      storage: createJSONStorage(() => localStorage),
      // БЕЗОПАСНОСТЬ: Сохраняем только безопасные данные
      partialize: (state) => ({
        // Сохраняем только минимальные данные для UI, без чувствительной информации
        user: sanitizeUserForStorage(state.user),
        isAuthenticated: state.isAuthenticated,
      }),
      // Merge persisted state with current state after hydration
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined;
        
        return {
          ...currentState,
          ...(persisted || {}),
          // После гидратации выключаем loading
          isLoading: false,
          // isAuthenticated зависит от наличия user
          isAuthenticated: !!(persisted?.user),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
