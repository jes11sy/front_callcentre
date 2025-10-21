'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, User, Lock, ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Form components removed - not used

import { authApi, LoginCredentials } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

const adminLoginSchema = z.object({
  login: z.string().min(1, 'Логин обязателен').min(3, 'Минимум 3 символа'),
  password: z.string().min(1, 'Пароль обязателен').min(3, 'Минимум 3 символа'),
  rememberMe: z.boolean().optional(),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { login: loginUser } = useAuthStore();

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      login: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const data = form.getValues();
    
    // Валидация
    if (!data.login || !data.password) {
      setError('Заполните все поля');
      return;
    }
    
    if (data.login.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }
    
    if (data.password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginCredentials = {
        ...data,
        role: 'admin'
      };
      
      const response = await authApi.login(loginData);
      
      // Check if user is actually admin
      if (response.data.user.role !== 'admin') {
        setError('Доступ запрещен. Только для администраторов.');
        return;
      }
      
      // Save tokens and user data
      authApi.saveTokens(response.data.accessToken, response.data.refreshToken);
      authApi.saveUser(response.data.user);
      loginUser(response.data.user);

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: unknown) {
      
      let errorMessage = 'Ошибка входа. Проверьте логин и пароль.';
      
      if ((err as { response?: { status?: number } }).response?.status === 401) {
        errorMessage = 'Неверный логин или пароль';
      } else if ((err as { response?: { status?: number } }).response?.status === 403) {
        errorMessage = 'Доступ запрещен. Только для администраторов';
      } else if ((err as { response?: { status?: number } }).response?.status === 404) {
        errorMessage = 'Администратор не найден';
      } else if ((err as { response?: { status?: number } }).response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже';
      } else if ((err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message) {
        errorMessage = (err as { response: { data: { error: { message: string } } } }).response.data.error.message;
      } else if ((err as { message?: string }).message === 'Network Error') {
        errorMessage = 'Ошибка сети. Проверьте подключение';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      
      {/* Logo Section */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" className="h-96 w-[550px]" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#17212b] backdrop-blur-md rounded-2xl p-10 shadow-[0_0_50px_rgba(255,215,0,0.2)] border-2 border-[#FFD700]/30 relative z-10">
        <div className="text-center mb-8">
        </div>

        <div className="space-y-6">
            <div>
              <Label className="text-gray-300 text-base font-medium flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-[#FFD700]" />
                Логин администратора
              </Label>
              <Input
                placeholder="Введите логин"
                value={form.watch('login')}
                onChange={(e) => form.setValue('login', e.target.value)}
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
                  placeholder="Введите пароль"
                  value={form.watch('password')}
                  onChange={(e) => form.setValue('password', e.target.value)}
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
              <div className="relative">
                <input
                  type="checkbox"
                  id="rememberMe"
                  {...form.register('rememberMe')}
                  className="sr-only"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <div className="h-4 w-4 border-2 border-[#FFD700] rounded bg-[#0f0f23] flex items-center justify-center">
                    {form.watch('rememberMe') && (
                      <Check className="h-3 w-3 text-[#FFD700]" />
                    )}
                  </div>
                  <span className="text-sm text-gray-300">Запомнить меня</span>
                </label>
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
                    Войти
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-[#FFD700] hover:text-[#FFC700] underline transition-colors"
          >
            Вход для операторов
          </a>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm relative z-10">
        © 2025 Новые схемы. Все права защищены.
      </div>
    </div>
  );
}