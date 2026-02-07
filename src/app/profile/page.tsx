'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  User, 
  Edit, 
  Save, 
  X, 
  Calendar,
  MapPin,
  Mail,
  Shield,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance
import { useDesignStore } from '@/store/designStore';

// Схемы валидации
const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  city: z.string().min(2, 'Город должен содержать минимум 2 символа'),
  statusWork: z.string().min(1, 'Выберите рабочий статус'),
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
  statusWork: string;
  passport?: string;
  contract?: string;
  dateCreate: string;
  note?: string;
  role: string;
  createdAt: string;
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
  
  const { version, theme } = useDesignStore();
  const isV2 = version === 'v2';
  const isDark = theme === 'dark';

  // Формы
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  // 🍪 Получение профиля через axios
  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/profile');
      return response.data.data || response.data;
    }
  });

  // 🍪 Получение статистики профиля (только для операторов) через axios
  const { data: profileStats } = useQuery<ProfileStats>({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await api.get('/auth/profile/stats');
      return response.data.data || response.data;
    },
    enabled: profile?.role === 'operator'
  });

  // 🍪 Обновление профиля через axios
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

  // 🍪 Смена пароля через axios
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.put('/auth/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error?.message || 'Ошибка смены пароля');
      }

      const result = await response.json();
      return result.data || result;
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
        statusWork: profile.statusWork,
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
        statusWork: profile.statusWork,
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

  const getStatusColor = (status: string, forV2 = false) => {
    if (forV2) {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-700 border-green-200';
        case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
        case 'on_call': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'break': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'on_call': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'break': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  if (error) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${isV2 ? 'bg-[#F3F3EE] dark:bg-[#111827] font-myriad' : ''}`}>
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className={isV2 ? 'text-red-700 dark:text-red-400' : 'text-red-600'}>Ошибка при загрузке профиля</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper classes for V1
  const cardClass = "border-2 border-[#FFD700]/30 bg-[#17212b]";
  const inputClass = "bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]";
  const selectTriggerClass = "bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white";
  const selectContentClass = "bg-[#17212b] border-[#FFD700]/30";
  const selectItemClass = "!text-white focus:bg-[#FFD700]/20 focus:!text-white";

  // V2: Компактный минималистичный дизайн
  if (isV2) {
    // Получаем инициалы для аватара
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

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
                  <Badge className={getStatusColor(profile.status, true) + ' mt-1'}>
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
                    value={profileForm.watch('statusWork')} 
                    onValueChange={(value) => profileForm.setValue('statusWork', value)}
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
                  <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{getWorkStatusText(profile.statusWork)}</span>
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
                <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{formatDate(profile.dateCreate)}</span>
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

          </div>
        </div>
      </DashboardLayout>
    );
  }

  // V1: Оригинальный дизайн
  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen bg-[#0f0f23]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center text-[#FFD700]">
                  <User className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Мой профиль
                </h1>
                <p className="mt-2 text-gray-400">
                  Управление личной информацией и настройками
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFD700]" />
              <p className="text-gray-400">Загрузка профиля...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Основная информация */}
              <Card className={cardClass}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <User className="h-5 w-5 text-[#FFD700]" />
                        Основная информация
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Личные данные и контактная информация
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button 
                        onClick={handleEdit} 
                        variant="outline" 
                        className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleCancel} 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Отмена
                        </Button>
                        <Button 
                          onClick={profileForm.handleSubmit(handleSave)}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Сохранить
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Полное имя</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            {...profileForm.register('name')}
                            placeholder="Введите ваше имя"
                            className={inputClass}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{profile.name}</span>
                          </div>
                        )}
                        {profileForm.formState.errors.name && (
                          <p className="text-sm text-red-400">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login" className="text-gray-300">Логин</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{profile.login}</span>
                        </div>
                        <p className="text-xs text-gray-500">Логин нельзя изменить</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-300">Город</Label>
                        {isEditing ? (
                          <Input
                            id="city"
                            {...profileForm.register('city')}
                            placeholder="Введите город"
                            className={inputClass}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{profile.city}</span>
                          </div>
                        )}
                        {profileForm.formState.errors.city && (
                          <p className="text-sm text-red-400">
                            {profileForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-gray-300">Статус</Label>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <Badge className={getStatusColor(profile.status)}>
                            {getStatusText(profile.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">Статус устанавливается администратором</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="statusWork" className="text-gray-300">Рабочий статус</Label>
                        {isEditing ? (
                          <Select 
                            value={profileForm.watch('statusWork')} 
                            onValueChange={(value) => profileForm.setValue('statusWork', value)}
                          >
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent className={selectContentClass}>
                              <SelectItem value="offline" className={selectItemClass}>Оффлайн</SelectItem>
                              <SelectItem value="online" className={selectItemClass}>В сети</SelectItem>
                              <SelectItem value="break" className={selectItemClass}>Перерыв</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-white">{getWorkStatusText(profile.statusWork)}</span>
                          </div>
                        )}
                        {profileForm.formState.errors.statusWork && (
                          <p className="text-sm text-red-400">
                            {profileForm.formState.errors.statusWork.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateCreate" className="text-gray-300">Дата начала работы</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-white">{formatDate(profile.dateCreate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="note" className="text-gray-300">Примечание</Label>
                    {isEditing ? (
                      <Textarea
                        id="note"
                        {...profileForm.register('note')}
                        placeholder="Дополнительная информация..."
                        rows={3}
                        className={inputClass}
                      />
                    ) : (
                      <div className="p-3 rounded-md border bg-[#0f0f23] border-gray-600">
                        <span className="text-white">
                          {profile.note || 'Примечание не указано'}
                        </span>
                      </div>
                    )}
                    {profileForm.formState.errors.note && (
                      <p className="text-sm text-red-400">
                        {profileForm.formState.errors.note.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Статистика (только для операторов) */}
              {profile.role === 'operator' && profileStats && (
                <Card className={cardClass}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CheckCircle className="h-5 w-5 text-[#FFD700]" />
                      Статистика работы
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Показатели вашей работы
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FFD700]">
                          {profileStats.total.calls}
                        </div>
                        <p className="text-sm text-gray-400">Всего звонков</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {profileStats.total.orders}
                        </div>
                        <p className="text-sm text-gray-400">Всего заказов</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {profileStats.monthly.calls}
                        </div>
                        <p className="text-sm text-gray-400">Звонков за месяц</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">
                          {profileStats.today.calls}
                        </div>
                        <p className="text-sm text-gray-400">Звонков сегодня</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Смена пароля */}
              <Card className={cardClass}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5 text-[#FFD700]" />
                        Безопасность
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Управление паролем и безопасностью
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      variant="outline"
                      className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700]"
                    >
                      {isChangingPassword ? 'Отмена' : 'Сменить пароль'}
                    </Button>
                  </div>
                </CardHeader>
                {isChangingPassword && (
                  <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-300">Текущий пароль</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...passwordForm.register('currentPassword')}
                            placeholder="Введите текущий пароль"
                            className={inputClass}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-400">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-300">Новый пароль</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            {...passwordForm.register('newPassword')}
                            placeholder="Введите новый пароль"
                            className={inputClass}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-400">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Подтвердите пароль</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...passwordForm.register('confirmPassword')}
                            placeholder="Подтвердите новый пароль"
                            className={inputClass}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-400">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsChangingPassword(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Отмена
                        </Button>
                        <Button 
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
                        >
                          {changePasswordMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Сохранить пароль
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                )}
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
