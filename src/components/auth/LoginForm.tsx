'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, User, Lock, ArrowRight, Palette, Sun, Moon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/ui/loading-screen';

import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  // Ref для предотвращения повторной проверки авторизации
  const hasCheckedAuth = useRef(false);
  
  const _router = useRouter(); // Оставляем для возможного использования
  const _authStore = useAuthStore(); // Сохраняем для возможного использования
  const { version, toggleVersion, theme, toggleTheme } = useDesignStore();

  // Проверяем авторизацию при загрузке (ОДИН РАЗ)
  useEffect(() => {
    // Предотвращаем повторную проверку
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    const checkAuth = async () => {
      try {
        // 1. Проверяем активную сессию через cookies
        const isAuthenticated = await authApi.isAuthenticated();
        if (isAuthenticated) {
          window.location.href = '/telephony';
          return;
        }
        
        // 2. Cookies не работают — пробуем восстановить через IndexedDB
        const restored = await authApi.restoreSessionFromIndexedDB();
        if (restored) {
          window.location.href = '/telephony';
          return;
        }
      } catch {
        // Показываем форму логина
      }
      
      setIsCheckingAuth(false);
    };
    
    checkAuth();
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
      
      // Use window.location for hard redirect to ensure cookies are sent
      window.location.href = '/telephony';
      
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

  // Кнопка переключения версии - только для V1
  const VersionToggle = () => (
    version === 'v1' ? (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={toggleVersion}
        className="absolute top-4 right-4 z-20 gap-2 font-mono border text-[#FFD700] hover:text-[#02111B] hover:bg-[#FFD700] border-[#FFD700]/30"
        title="Текущий дизайн: V1. Нажми для переключения."
      >
        <Palette className="h-4 w-4" />
        <span className="text-xs font-bold">V1</span>
      </Button>
    ) : null
  );

  // Переключатель темы - маленькая иконка в углу карточки (только для V2)
  const ThemeToggle = () => (
    version === 'v2' ? (
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
    ) : null
  );

  // Показываем загрузку пока проверяем авторизацию
  if (isCheckingAuth) {
    return (
      <div className="relative">
        <VersionToggle />
        <LoadingScreen />
      </div>
    );
  }

  // ============ V2 DESIGN ============
  if (version === 'v2') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1e2530]' : 'bg-[#F3F3EE]'
      }`} style={{ fontFamily: "'Myriad Pro', sans-serif" }}>
        <VersionToggle />

        {/* Login Card V2 */}
        <div className={`w-full max-w-md rounded-2xl p-10 shadow-xl relative z-10 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#2a3441]' : 'bg-white'
        }`}>
          <ThemeToggle />
          {/* Logo V2 */}
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

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
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
              type="button"
              onClick={handleLogin}
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

        {/* Footer V2 */}
        <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-sm transition-colors ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          © 2025 Новые схемы
        </div>
      </div>
    );
  }

  // ============ V1 DESIGN (Original) ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 relative overflow-hidden">
      <VersionToggle />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-[#FFD700]/5 to-transparent"></div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
        <Image src="/logo.png" alt="Logo" width={224} height={48} className="h-12 w-56" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#17212b] backdrop-blur-md rounded-2xl p-10 shadow-[0_0_50px_rgba(255,215,0,0.2)] border-2 border-[#FFD700]/30 relative z-10">
        <div className="text-center mb-8">
        </div>

        <div onClick={(e) => e.preventDefault()}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <Label className="text-gray-300 text-base font-medium flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-[#FFD700]" />
              Логин
            </Label>
            <Input
              placeholder="Введите ваш логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={isLoading}
              className="h-12 pl-4 bg-[#0f0f23] border-2 border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700] transition-colors"
            />
          </div>

          <div>
            <Label className="text-gray-300 text-base font-medium flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-[#FFD700]" />
              Пароль
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 pl-4 pr-12 bg-[#0f0f23] border-2 border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700] transition-colors"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 text-gray-500 hover:text-[#FFD700] hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-4 rounded-lg border-2 border-red-500/30">
              {error}
            </div>
          )}

          <div onClick={(e) => e.preventDefault()}>
            <Button
              type="button"
              onClick={handleLogin}
              className="w-full h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Вход в систему...
                </>
              ) : (
                <>
                  Войти в систему
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-400 text-sm z-10">
        © 2025 Новые схемы. Все права защищены.
      </div>
    </div>
  );
}