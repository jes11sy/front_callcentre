'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Edit, 
  Save, 
  X, 
  Loader2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  Bell,
  BellOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Схемы валидации
const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  city: z.string().min(2, 'Город должен содержать минимум 2 символа'),
  status: z.string().min(1, 'Выберите рабочий статус'),
  note: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(6, 'Новый пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface Profile {
  id: number;
  name: string;
  login: string;
  city: string;
  status: string;
  passport?: string;
  contract?: string;
  createdAt: string;
  note?: string;
  role: string;
  updatedAt: string;
  _count?: {
    calls: number;
    orders: number;
  };
}

interface ProfileStats {
  operator: {
    id: number;
    name: string;
    city: string;
    startDate: string;
  };
  total: {
    calls: number;
    orders: number;
  };
  monthly: {
    calls: number;
    orders: number;
  };
  today: {
    calls: number;
    orders: number;
  };
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    permission: pushPermission,
    subscribe: subscribePush,
    isSubscribing: isPushSubscribing,
    isLoading: isPushLoading,
  } = usePushNotifications();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/login');
    }
  };

  // Формы
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  // Получение профиля через axios
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/profile');
      return response.data.data || response.data;
    }
  });

  // Получение статистики профиля (только для операторов) через axios
  const { data: profileStats } = useQuery<ProfileStats>({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await api.get('/auth/profile/stats');
      return response.data.data || response.data;
    },
    enabled: profile?.role === 'operator'
  });

  // Обновление профиля через axios
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put('/auth/profile', data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      toast.success('Профиль успешно обновлен');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profileStats'] });
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string }).message || 'Ошибка обновления профиля');
    }
  });

  // Смена пароля через axios
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.put('/auth/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      return response.data.data || response.data;
    },
    onSuccess: () => {
      toast.success('Пароль успешно изменен');
      setIsChangingPassword(false);
      passwordForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error: unknown) => {
      toast.error((error as { message?: string }).message || 'Ошибка смены пароля');
    }
  });

  // Инициализация формы при загрузке профиля
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        city: profile.city,
        status: profile.status,
        note: profile.note || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      profileForm.reset({
        name: profile.name,
        city: profile.city,
        status: profile.status,
        note: profile.note || ''
      });
    }
  };

  const handleSave = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      case 'on_call': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'break': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'on_call': return 'На звонке';
      case 'break': return 'Перерыв';
      default: return status;
    }
  };

  const getWorkStatusText = (status: string) => {
    switch (status) {
      case 'offline': return 'Оффлайн';
      case 'online': return 'В сети';
      case 'break': return 'Перерыв';
      default: return status;
    }
  };

  // Получаем инициалы для аватара
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 dark:text-red-400">Ошибка при загрузке профиля</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className={`py-10 px-10 min-h-screen font-myriad transition-colors duration-300 ${
          isDark ? 'bg-[#111827]' : 'bg-[#F3F3EE]'
        }`}>
          <div className="max-w-3xl">
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FEC004]" />
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Загрузка профиля...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className={`py-10 px-10 min-h-screen font-myriad transition-colors duration-300 ${
        isDark ? 'bg-[#111827]' : 'bg-[#F3F3EE]'
      }`}>
        <div className="max-w-3xl space-y-8">
          
          {/* Шапка профиля */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FEC004] flex items-center justify-center text-gray-900 text-xl font-medium">
                {getInitials(profile.name)}
              </div>
              <div>
                <h1 className={`text-xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profile.name}</h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{profile.login} • {profile.city}</p>
                <Badge className={getStatusColor(profile.status) + ' mt-1'}>
                  {getStatusText(profile.status)}
                </Badge>
              </div>
            </div>
            {!isEditing ? (
              <Button 
                onClick={handleEdit} 
                variant="ghost"
                className={`hover:text-[#FEC004] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="ghost" className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={profileForm.handleSubmit(handleSave)}
                  disabled={updateProfileMutation.isPending}
                  className="bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900"
                >
                  {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Статистика (для операторов) */}
          {profile.role === 'operator' && profileStats && (
            <>
              <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.total.calls}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Звонков</div>
                </div>
                <div>
                  <div className={`text-2xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.total.orders}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Заказов</div>
                </div>
                <div>
                  <div className={`text-2xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.monthly.calls}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>За месяц</div>
                </div>
                <div>
                  <div className={`text-2xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.today.calls}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Сегодня</div>
                </div>
              </div>
            </>
          )}

          {/* Информация */}
          <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
          
          <div className="space-y-4">
            {/* Рабочий статус */}
            <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Рабочий статус</span>
              {isEditing ? (
                <Select 
                  value={profileForm.watch('status')} 
                  onValueChange={(value) => profileForm.setValue('status', value)}
                >
                  <SelectTrigger className={`w-32 ${
                    isDark 
                      ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#1e2530] border-gray-600' : 'bg-white border-gray-200'}>
                    <SelectItem value="offline" className={isDark ? 'text-gray-100' : 'text-gray-900'}>Оффлайн</SelectItem>
                    <SelectItem value="online" className={isDark ? 'text-gray-100' : 'text-gray-900'}>В сети</SelectItem>
                    <SelectItem value="break" className={isDark ? 'text-gray-100' : 'text-gray-900'}>Перерыв</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{getWorkStatusText(profile.status)}</span>
              )}
            </div>

            {/* Город (редактируемый) */}
            <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Город</span>
              {isEditing ? (
                <Input
                  {...profileForm.register('city')}
                  className={`w-40 text-right ${
                    isDark 
                      ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              ) : (
                <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{profile.city}</span>
              )}
            </div>

            {/* Дата начала */}
            <div className={`flex justify-between items-center py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Дата начала</span>
              <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{formatDate(profile.createdAt)}</span>
            </div>

            {/* Примечание */}
            <div className={`flex justify-between items-start py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Примечание</span>
              {isEditing ? (
                <Textarea
                  {...profileForm.register('note')}
                  className={`w-64 ${
                    isDark 
                      ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  rows={2}
                />
              ) : (
                <span className={`text-right max-w-xs ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profile.note || 'Не указано'}</span>
              )}
            </div>
          </div>

          {/* Смена пароля */}
          <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
          
          <div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className={`hover:text-[#FEC004] transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {isChangingPassword ? 'Отмена' : 'Сменить пароль'}
            </button>

            {isChangingPassword && (
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="mt-4 space-y-4">
                <div className="space-y-1">
                  <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      className={`pr-10 ${
                        isDark 
                          ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Новый пароль</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      className={`pr-10 ${
                        isDark 
                          ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Подтвердите пароль</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                      className={`pr-10 ${
                        isDark 
                          ? 'bg-[#1e2530] border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900"
                >
                  {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Сохранить пароль
                </Button>
              </form>
            )}
          </div>

          {/* Push-уведомления */}
          {isPushSupported && (
            <>
              <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
              <div className={`flex justify-between items-center py-2`}>
                <div className="flex items-center gap-2">
                  {isPushSubscribed ? (
                    <Bell className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <BellOff className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Push-уведомления</span>
                </div>
                <button
                  onClick={() => subscribePush()}
                  disabled={isPushSubscribing || pushPermission === 'denied'}
                  className={`text-sm transition-colors disabled:opacity-50 ${
                    isPushSubscribed
                      ? 'text-green-500 hover:text-green-600'
                      : pushPermission === 'denied'
                      ? 'text-red-400 cursor-not-allowed'
                      : `hover:text-[#FEC004] ${isDark ? 'text-gray-400' : 'text-gray-500'}`
                  }`}
                >
                  {isPushLoading
                    ? 'Загрузка...'
                    : isPushSubscribing
                    ? 'Подключение...'
                    : isPushSubscribed
                    ? 'Включены'
                    : pushPermission === 'denied'
                    ? 'Заблокированы'
                    : 'Включить'}
                </button>
              </div>
            </>
          )}

          {/* Выход */}
          <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${
              isDark ? 'text-red-400' : ''
            }`}
          >
            <LogOut className="h-4 w-4" />
            Выйти из аккаунта
          </Button>

        </div>
      </div>
    </DashboardLayout>
  );
}
