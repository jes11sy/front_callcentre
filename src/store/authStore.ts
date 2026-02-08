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

/**
 * Синхронно читаем пользователя из storage при инициализации
 * Это предотвращает мерцание в PWA
 */
function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Сначала проверяем localStorage (rememberMe)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      return JSON.parse(localUser);
    }
    
    // Потом sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }
    
    // Проверяем zustand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed?.state?.user) {
        return parsed.state.user;
      }
    }
  } catch {
    // Игнорируем ошибки парсинга
  }
  
  return null;
}

// ✅ Инициализируем с данными из storage сразу
const initialUser = typeof window !== 'undefined' ? getInitialUser() : null;

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
      // ✅ Начинаем с кэшированного пользователя если есть
      user: initialUser,
      isAuthenticated: !!initialUser,
      // ✅ Если есть кэшированный пользователь - не показываем loading
      isLoading: !initialUser,
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
