'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  // Переключатель темы
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
        theme === 'dark' 
          ? 'text-[#FEC004] hover:bg-gray-700/50' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );

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
    <div className={`min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#1e2530]' : 'bg-[#F3F3EE]'
    }`} style={{ fontFamily: "'Myriad Pro', sans-serif" }}>

      {/* Login Card */}
      <div className={`w-full max-w-md rounded-2xl p-10 shadow-xl relative z-10 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#2a3441]' : 'bg-white'
      }`}>
        <ThemeToggle />
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src={theme === 'dark' ? "/img/logo/dark_logo_v2.png" : "/img/logo/logo_v2.png"} 
            alt="Logo" 
            width={180} 
            height={40} 
            className="h-10 w-auto" 
          />
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-semibold text-center mb-8 transition-colors ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
        }`}>
          Авторизация
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
          <div>
            <Label className={`text-sm font-medium mb-2 block transition-colors ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Логин
            </Label>
            <Input
              placeholder="Введите логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={isLoading}
              className={`h-12 border transition-colors rounded-lg ${
                theme === 'dark' 
                  ? 'bg-[#1e2530] border-gray-600 text-gray-100 placeholder:text-gray-500 hover:border-gray-500 focus-visible:border-[#FEC004] focus-visible:ring-[3px] focus-visible:ring-[#FEC004]/30' 
                  : 'bg-[#F3F3EE] border-gray-300 text-gray-800 placeholder:text-gray-400 hover:border-gray-400 focus-visible:border-[#FEC004] focus-visible:ring-[3px] focus-visible:ring-[#FEC004]/30'
              }`}
            />
          </div>

          <div>
            <Label className={`text-sm font-medium mb-2 block transition-colors ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Пароль
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`h-12 pr-12 border transition-colors rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-[#1e2530] border-gray-600 text-gray-100 placeholder:text-gray-500 hover:border-gray-500 focus-visible:border-[#FEC004] focus-visible:ring-[3px] focus-visible:ring-[#FEC004]/30' 
                    : 'bg-[#F3F3EE] border-gray-300 text-gray-800 placeholder:text-gray-400 hover:border-gray-400 focus-visible:border-[#FEC004] focus-visible:ring-[3px] focus-visible:ring-[#FEC004]/30'
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-0 top-0 h-12 px-3 hover:bg-transparent transition-colors ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-800'
                }`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#FEC004] hover:bg-[#e5ad04] text-gray-900 font-semibold rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-sm transition-colors ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        © {new Date().getFullYear()} Новые схемы
      </div>
    </div>
  );
}
