'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, CircleUserRound, Eye, EyeOff, LockKeyhole, MoonStar, SunMedium } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-screen';

import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useDesignStoreHydrated } from '@/store/designStore';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  // Ref для предотвращения повторной проверки авторизации
  const hasCheckedAuth = useRef(false);
  
  const router = useRouter();
  const { login: authLogin } = useAuthStore();
  
  // Используем хук с поддержкой гидратации для предотвращения ошибки React #418
  const { theme, toggleTheme, isHydrated } = useDesignStoreHydrated();
  
  // Проверяем авторизацию при загрузке (ОДИН РАЗ)
  useEffect(() => {
    // Предотвращаем повторную проверку
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    const checkAuth = async () => {
      try {
        // 1. Проверяем активную сессию через cookies и получаем профиль
        const response = await authApi.getProfile().catch(() => null);
        if (response?.success && response.data) {
          // ВАЖНО: Обновляем authStore перед редиректом!
          authLogin(response.data);
          // ✅ FIX: Используем router.replace вместо window.location.href
          // Это предотвращает полную перезагрузку страницы и бесконечный цикл редиректов
          router.replace('/telephony');
          return;
        }
        
        // 2. Cookies не работают — пробуем восстановить через IndexedDB
        const restored = await authApi.restoreSessionFromIndexedDB();
        if (restored) {
          // Получаем профиль после восстановления сессии
          const restoredResponse = await authApi.getProfile().catch(() => null);
          if (restoredResponse?.success && restoredResponse.data) {
            authLogin(restoredResponse.data);
            // ✅ FIX: Используем router.replace вместо window.location.href
            router.replace('/telephony');
            return;
          }
        }
      } catch {
        // Ошибка - показываем форму логина
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    
    // Валидация
    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }
    
    if (login.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }
    
    if (password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const loginData = {
        login,
        password,
        role: 'operator' as const
      };
      
      const response = await authApi.login(loginData);
      
      // Save user data (tokens in cookies + IndexedDB)
      await authApi.saveTokens(response.data.accessToken || '', response.data.refreshToken || '', true);
      await authApi.saveUser(response.data.user, true);
      
      // ✅ FIX: Записываем auth-storage напрямую перед редиректом
      // Без этого zustand persist перезапишет store стухшими данными { user: null }
      // при полной перезагрузке страницы, что вызывает мерцание
      const u = response.data.user;
      try {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: { id: u.id, login: u.login, name: u.name || '', role: u.role, cities: u.cities },
            isAuthenticated: true,
          },
          version: 0,
        }));
      } catch {}
      
      // ✅ FIX: Используем router.replace вместо window.location.href
      // Это предотвращает полную перезагрузку и бесконечный цикл редиректов
      router.replace('/telephony');
      
    } catch (error: unknown) {
      // Don't show error if session expired (already redirecting to login)
      if ((error as any)?.message === 'SESSION_EXPIRED' || (error as any)?.isSessionExpired) {
        return;
      }
      
      if ((error as { response?: { status?: number; data?: { message?: string } } }).response) {
        const status = (error as { response: { status: number; data?: { message?: string } } }).response.status;
        const errorMessage = (error as { response: { data?: { message?: string } } }).response.data?.message || 'Ошибка авторизации';
        
        switch (status) {
          case 401:
            setError('Неверный логин или пароль');
            break;
          case 403:
            setError('Доступ запрещен');
            break;
          case 404:
            setError('Пользователь не найден');
            break;
          case 500:
            setError('Ошибка сервера. Попробуйте позже');
            break;
          default:
            setError(errorMessage);
        }
      } else if ((error as { request?: unknown }).request) {
        setError('Ошибка сети. Проверьте подключение к интернету');
      } else {
        setError('Произошла ошибка. Попробуйте снова');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Показываем загрузку пока проверяем авторизацию или ждём гидратации store
  // Это предотвращает ошибку гидратации React #418
  if (isCheckingAuth || !isHydrated) {
    return (
      <div className="relative">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#111113] text-white'
          : 'bg-[#f7f7f5] text-[#1d1d1f]'
      }`}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif'
      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_24%),linear-gradient(180deg,_#111113,_#0c0c0d)]'
            : 'bg-[linear-gradient(180deg,_#ffffff,_#f7f7f5),radial-gradient(circle_at_top,_rgba(254,192,4,0.16),_transparent_28%)]'
        }`}
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-white/[0.025]' : 'bg-[#FEC004]/20'
        }`}
      />

      <button
        onClick={toggleTheme}
        className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
          theme === 'dark'
            ? 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
            : 'border-black/[0.06] bg-white/80 text-[#6e6e73] hover:bg-white'
        }`}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      >
        {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      </button>

      <div
        className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 shadow-2xl ${
          theme === 'dark'
            ? 'border-white/10 bg-white/[0.04] backdrop-blur-xl'
            : 'border-black/[0.06] bg-white/90 backdrop-blur-xl'
        }`}
      >
        <h1 className={`mb-8 text-center text-2xl font-semibold transition-colors ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Авторизация
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="login" className="sr-only">
                Логин
              </Label>
              <div
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'border-white/10 bg-[#1c1c1e] focus-within:border-white/30 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.07)]'
                    : 'border-[#d2d2d7] bg-white/95 focus-within:border-[#FEC004] focus-within:shadow-[0_0_0_3px_rgba(254,192,4,0.22)]'
                }`}
              >
                <CircleUserRound
                  className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                    theme === 'dark'
                      ? 'text-white/35 group-focus-within:text-white/70'
                      : 'text-[#8e8e93] group-focus-within:text-[#b58500]'
                  }`}
                />
                <input
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className={`h-[56px] w-full border-0 bg-transparent pl-12 pr-4 text-[16px] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                    theme === 'dark'
                      ? 'text-white placeholder:text-white/25'
                      : 'text-[#1d1d1f] placeholder:text-[#8e8e93]'
                  }`}
                  style={{ WebkitAppearance: 'none' }}
                  required
                  autoComplete="username"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="sr-only">
                Пароль
              </Label>
              <div
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'border-white/10 bg-[#1c1c1e] focus-within:border-white/30 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.07)]'
                    : 'border-[#d2d2d7] bg-white/95 focus-within:border-[#FEC004] focus-within:shadow-[0_0_0_3px_rgba(254,192,4,0.22)]'
                }`}
              >
                <LockKeyhole
                  className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                    theme === 'dark'
                      ? 'text-white/35 group-focus-within:text-white/70'
                      : 'text-[#8e8e93] group-focus-within:text-[#b58500]'
                  }`}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-[56px] w-full border-0 bg-transparent pl-12 pr-12 text-[16px] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 ${
                    theme === 'dark'
                      ? 'text-white placeholder:text-white/25'
                      : 'text-[#1d1d1f] placeholder:text-[#8e8e93]'
                  }`}
                  style={{ WebkitAppearance: 'none' }}
                  required
                  autoComplete="current-password"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'text-white/38 hover:bg-white/5 hover:text-white/72'
                      : 'text-[#8e8e93] hover:bg-black/[0.03] hover:text-[#1d1d1f]'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#FEC004] hover:bg-[#e5ad04] text-gray-900 font-semibold rounded-lg transition-colors"

            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Войти
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs transition-colors ${
        theme === 'dark' ? 'text-white/35' : 'text-[#6e6e73]'
      }`}>
        © {new Date().getFullYear()} Новые схемы

      </div>
    </div>
  );
}
