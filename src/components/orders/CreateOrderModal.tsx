'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  Plus, 
  User, 
  FileText, 
  Settings
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { useCities, useRKs, useEquipmentTypes } from '@/hooks/useStaticData';

const orderSchema = z.object({
  rkId: z.number({ required_error: 'Рекламная Компания обязательна' }).min(1, 'Рекламная Компания обязательна'),
  cityId: z.number({ required_error: 'Город обязателен' }).min(1, 'Город обязателен'),
  phone: z.string()
    .min(11, 'Телефон должен содержать 11 цифр')
    .max(11, 'Телефон должен содержать 11 цифр')
    .regex(/^7\d{10}$/, 'Телефон должен начинаться с 7 и содержать 11 цифр'),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия'], { 
    message: 'Тип заказа обязателен' 
  }),
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  address: z.string().min(1, 'Адрес обязателен'),
  dateMeeting: z.string().min(1, 'Дата встречи обязательна'),
  equipmentTypeId: z.number({ required_error: 'Тип техники обязателен' }).min(1, 'Тип техники обязателен'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: () => void;
}

export default function CreateOrderModal({ 
  open, 
  onOpenChange, 
  onOrderCreated 
}: CreateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore(); // 🍪 Получаем user из store
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

  const { data: cities = [] } = useCities();
  const { data: rks = [] } = useRKs();
  const { data: equipmentTypes = [] } = useEquipmentTypes();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rkId: 0,
      cityId: 0,
      phone: '',
      typeOrder: undefined,
      clientName: '',
      address: '',
      dateMeeting: '',
      equipmentTypeId: 0,
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = form;

  // 🍪 Отправка заказа через axios
  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);

      const response = await api.post('/orders', {
        ...data,
        operatorId: user?.id || 0
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(response.data.message || 'Заказ успешно создан');
      handleClose();
      onOrderCreated?.();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Ошибка при создании заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  const fieldClassName = isDark
    ? 'h-9 border-white/15 bg-white/[0.04] text-white placeholder:text-white/30 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/35'
    : 'h-9 border-black/[0.1] bg-white text-[#111113] placeholder:text-[#8e8e93] outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#FEC004]/55';
  const selectClassName = `${fieldClassName} [&_[data-placeholder]]:${isDark ? 'text-white/30' : 'text-[#8e8e93]'} [&_svg]:${isDark ? 'text-white/60' : 'text-[#6f7177]'}`;
  const sectionCardClass = isDark
    ? 'rounded-2xl border border-white/10 bg-white/[0.03] shadow-none'
    : 'rounded-2xl border border-black/[0.08] bg-white shadow-none';
  const sectionTitleIconClass = isDark ? 'text-white' : 'text-[#b58500]';
  const modalBodyClass = isDark ? 'bg-[#111113]' : 'bg-[#f5f5f7]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-6">
      <div className={`font-myriad flex w-full max-w-5xl flex-col rounded-[20px] border shadow-2xl max-h-[90vh] ${
        isDark ? 'border-white/10 bg-[#111113]' : 'border-black/[0.08] bg-[#f5f5f7]'
      }`}>
        <div className={`flex items-center justify-between border-b px-3 py-2 sm:px-5 sm:py-4 ${
          isDark ? 'border-white/10 bg-[#121417]' : 'border-black/[0.08] bg-white'
        }`}>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 sm:text-xl dark:text-gray-100">
            <span className="hidden sm:inline">Создать новый заказ</span>
            <span className="sm:hidden">Новый заказ</span>
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg p-0 text-gray-400 transition-colors hover:bg-black/[0.05] hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${modalBodyClass}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-3 sm:p-5">
          {/* Основная информация */}
          <Card className={sectionCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <FileText className={`h-4 w-4 ${sectionTitleIconClass}`} />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
<<<<<<< Updated upstream
                  <Label htmlFor="rkId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Рекламная Компания *</Label>
=======
                  <Label htmlFor="rk" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Рекламная Компания *</Label>
>>>>>>> Stashed changes
                  <Controller
                    name="rkId"
                    control={form.control}
                    render={({ field }) => (
<<<<<<< Updated upstream
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите РК" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {rks.map((rk) => (
                            <SelectItem key={rk.id} value={rk.id.toString()} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {rk.name}
=======
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={selectClassName}>
                          <SelectValue placeholder="Выберите РК" />
                        </SelectTrigger>
                        <SelectContent className="border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#161a20]">
                          {RK_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">
                              {option}
>>>>>>> Stashed changes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rkId && (
                    <p className="text-sm text-red-400">{errors.rkId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
<<<<<<< Updated upstream
                  <Label htmlFor="cityId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Город *</Label>
=======
                  <Label htmlFor="city" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Город *</Label>
>>>>>>> Stashed changes
                  <Controller
                    name="cityId"
                    control={form.control}
                    render={({ field }) => (
<<<<<<< Updated upstream
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {city.name}
=======
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={selectClassName}>
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                        <SelectContent className="border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#161a20]">
                          {CITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">
                              {option}
>>>>>>> Stashed changes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.cityId && (
                    <p className="text-sm text-red-400">{errors.cityId.message}</p>
                  )}
                </div>
<<<<<<< Updated upstream
=======
                <div className="space-y-2">
                  <Label htmlFor="avitoName" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Источник</Label>
                  <Controller
                    name="avitoName"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={selectClassName}>
                          <SelectValue placeholder="Выберите источник" />
                        </SelectTrigger>
                        <SelectContent className="border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#161a20]">
                          {SOURCE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
>>>>>>> Stashed changes
              </div>
            </CardContent>
          </Card>

          {/* Информация о клиенте */}
          <Card className={sectionCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <User className={`h-4 w-4 ${sectionTitleIconClass}`} />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Имя клиента *</Label>
                  <Input
                    id="clientName"
                    {...register('clientName')}
                    placeholder="Введите имя клиента"
                    className={fieldClassName}
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-400">{errors.clientName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Телефон *</Label>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="phone"
                        type="tel"
                        value={field.value.startsWith('7') && field.value.length > 1 ? '+7' + field.value.slice(1) : ''}
                        onChange={(e) => {
                          let input = e.target.value.replace(/\D/g, ''); // Только цифры
                          
                          // Если пользователь ввел 8 или 9 в начале
                          if (input.startsWith('8')) {
                            input = '7' + input.slice(1);
                          } else if (input.startsWith('9')) {
                            input = '7' + input;
                          } else if (input.length > 0 && !input.startsWith('7')) {
                            input = '7' + input;
                          }
                          
                          // Ограничиваем 11 цифрами
                          if (input.length > 11) {
                            input = input.slice(0, 11);
                          }
                          
                          field.onChange(input);
                        }}
                        placeholder="Введите номер телефона"
                        className={fieldClassName}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Адрес *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Введите адрес"
                  className={fieldClassName}
                />
                {errors.address && (
                  <p className="text-sm text-red-400">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Детали заказа */}
          <Card className={sectionCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <Settings className={`h-4 w-4 ${sectionTitleIconClass}`} />
                Детали заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="typeOrder" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Тип заказа *</Label>
                  <Controller
                    name="typeOrder"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={selectClassName}>
                          <SelectValue placeholder="Выберите тип заказа" />
                        </SelectTrigger>
                        <SelectContent className="border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#161a20]">
                          <SelectItem value="Впервые" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">Впервые</SelectItem>
                          <SelectItem value="Повтор" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">Повтор</SelectItem>
                          <SelectItem value="Гарантия" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">Гарантия</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.typeOrder && (
                    <p className="text-sm text-red-400">{errors.typeOrder.message}</p>
                  )}
                </div>
                <div className="space-y-2">
<<<<<<< Updated upstream
                  <Label htmlFor="equipmentTypeId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Тип техники *</Label>
=======
                  <Label htmlFor="typeEquipment" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Тип техники *</Label>
>>>>>>> Stashed changes
                  <Controller
                    name="equipmentTypeId"
                    control={form.control}
                    render={({ field }) => (
<<<<<<< Updated upstream
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите тип техники" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {equipmentTypes.map((et) => (
                            <SelectItem key={et.id} value={et.id.toString()} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {et.name}
                            </SelectItem>
                          ))}
=======
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={selectClassName}>
                          <SelectValue placeholder="Выберите тип техники" />
                        </SelectTrigger>
                        <SelectContent className="border-black/[0.08] bg-white dark:border-white/10 dark:bg-[#161a20]">
                          <SelectItem value="КП" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">КП</SelectItem>
                          <SelectItem value="БТ" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">БТ</SelectItem>
                          <SelectItem value="МНЧ" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-black/[0.04] data-[highlighted]:text-[#111113] dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white">МНЧ</SelectItem>
>>>>>>> Stashed changes
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.equipmentTypeId && (
                    <p className="text-sm text-red-400">{errors.equipmentTypeId.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateMeeting" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Дата встречи *</Label>
                <Input
                  id="dateMeeting"
                  type="datetime-local"
                  {...register('dateMeeting')}
                  className={`${fieldClassName} dark:[color-scheme:dark]`}
                />
                {errors.dateMeeting && (
                  <p className="text-sm text-red-400">{errors.dateMeeting.message}</p>
                )}
              </div>
<<<<<<< Updated upstream
=======
              <div className="space-y-2">
                <Label htmlFor="problem" className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">Описание проблемы *</Label>
                <Textarea
                  id="problem"
                  {...register('problem')}
                  placeholder="Опишите проблему"
                  rows={2}
                  className={`${fieldClassName} resize-none`}
                />
                {errors.problem && (
                  <p className="text-sm text-red-400">{errors.problem.message}</p>
                )}
              </div>
>>>>>>> Stashed changes
            </CardContent>
          </Card>

            {/* Кнопки внизу */}
            <div className={`flex justify-end gap-2 sm:gap-3 px-1 pb-4 pt-2 border-t ${
              isDark ? 'border-white/10' : 'border-black/[0.08]'
            }`}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`text-sm ${
                  isDark
                    ? 'border-white/15 text-gray-300 hover:bg-white/10 hover:text-white'
                    : 'border-black/[0.12] text-gray-600 hover:bg-black/[0.05] hover:text-[#111113]'
                }`}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`text-sm font-semibold ${
                  isDark
                    ? 'bg-white text-[#111113] hover:bg-white/90'
                    : 'bg-[#FEC004] text-[#111113] hover:bg-[#e3ac00]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Создание...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Создать заказ</span>
                    <span className="sm:hidden">Создать</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}