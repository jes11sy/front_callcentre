'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, User, Lock, ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const router = useRouter();
  const { setUser: _setUser, login: loginUser } = useAuthStore();

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
        rememberMe,
        role: 'operator' as const
      };
      
      const response = await authApi.login(loginData);
      
      // Save tokens and user data securely
      await authApi.saveTokens(response.data.accessToken, response.data.refreshToken);
      await authApi.saveUser(response.data.user);
      loginUser(response.data.user);
      
      // Redirect based on role
      router.push('/');
      
    } catch (error: unknown) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-[#FFD700]/5 to-transparent"></div>
      </div>
      
      {/* Logo */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
        <Image src="/logo.png" alt="Logo" width={550} height={384} className="h-96 w-[550px]" />
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <div 
              className="h-4 w-4 border-2 border-[#FFD700] rounded bg-[#0f0f23] flex items-center justify-center cursor-pointer"
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && (
                <Check className="h-3 w-3 text-[#FFD700]" />
              )}
            </div>
            <span 
              className="text-sm text-gray-300 cursor-pointer"
              onClick={() => setRememberMe(!rememberMe)}
            >
              Запомнить меня
            </span>
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