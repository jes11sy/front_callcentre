'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  Plus, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  Settings
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore'; // 🍪 Используем authStore для получения user
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance
import { useDesignStore } from '@/store/designStore';

// Опции для выпадающих списков
const RK_OPTIONS = ['Авито', 'Листовка'] as const;
const CITY_OPTIONS = ['Саратов', 'Энгельс', 'Ульяновск', 'Пенза', 'Тольятти', 'Омск', 'Ярославль'] as const;
const SOURCE_OPTIONS = [
  'Не указано',
  'Владимир',
  'Диспетчер МНЧ Расклейка',
  'Сайт Водоканал',
  'Сайт Поверка',
  'Диспетчер Быт КП МНЧ',
  'Газета',
  'Поверка Счетчиков Партнер'
] as const;

const orderSchema = z.object({
  rk: z.enum(RK_OPTIONS, { message: 'Рекламная Компания обязательна' }),
  city: z.enum(CITY_OPTIONS, { message: 'Город обязателен' }),
  avitoName: z.enum(SOURCE_OPTIONS).optional(),
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
  typeEquipment: z.enum(['КП', 'БТ', 'МНЧ'], { 
    message: 'Тип техники обязателен' 
  }),
  problem: z.string().min(1, 'Описание проблемы обязательно'),
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

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rk: undefined,
      city: undefined,
      avitoName: undefined,
      phone: '',
      typeOrder: undefined,
      clientName: '',
      address: '',
      dateMeeting: '',
      typeEquipment: undefined,
      problem: ''
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
        operatorNameId: user?.id || 0
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-lg flex flex-col bg-[#F3F3EE] dark:bg-[#1e2530] sm:border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-none sm:max-w-2xl font-myriad">
        <div className="flex items-center justify-between px-3 sm:p-4 py-2 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]">
          <h2 className="text-base sm:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <span className="hidden sm:inline">Создать новый заказ</span>
            <span className="sm:hidden">Новый заказ</span>
          </h2>
          <button
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
          {/* Основная информация */}
          <Card className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <FileText className="h-5 w-5 text-[#FEC004]" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="rk" className="text-sm font-medium text-gray-600 dark:text-gray-400">Рекламная Компания *</Label>
                  <Controller
                    name="rk"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите РК" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {RK_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rk && (
                    <p className="text-sm text-red-400">{errors.rk.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-600 dark:text-gray-400">Город *</Label>
                  <Controller
                    name="city"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {CITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-400">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avitoName" className="text-sm font-medium text-gray-600 dark:text-gray-400">Источник</Label>
                  <Controller
                    name="avitoName"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите источник" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          {SOURCE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация о клиенте */}
          <Card className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="h-5 w-5 text-[#FEC004]" />
                Информация о клиенте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium text-gray-600 dark:text-gray-400">Имя клиента *</Label>
                  <Input
                    id="clientName"
                    {...register('clientName')}
                    placeholder="Введите имя клиента"
                    className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-400">{errors.clientName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон *</Label>
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
                        className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-600 dark:text-gray-400">Адрес *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Введите адрес"
                  className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
                />
                {errors.address && (
                  <p className="text-sm text-red-400">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Детали заказа */}
          <Card className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Settings className="h-5 w-5 text-[#FEC004]" />
                Детали заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="typeOrder" className="text-sm font-medium text-gray-600 dark:text-gray-400">Тип заказа *</Label>
                  <Controller
                    name="typeOrder"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите тип заказа" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          <SelectItem value="Впервые" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Впервые</SelectItem>
                          <SelectItem value="Повтор" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Повтор</SelectItem>
                          <SelectItem value="Гарантия" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Гарантия</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.typeOrder && (
                    <p className="text-sm text-red-400">{errors.typeOrder.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeEquipment" className="text-sm font-medium text-gray-600 dark:text-gray-400">Тип техники *</Label>
                  <Controller
                    name="typeEquipment"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Выберите тип техники" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                          <SelectItem value="КП" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">КП</SelectItem>
                          <SelectItem value="БТ" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">БТ</SelectItem>
                          <SelectItem value="МНЧ" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">МНЧ</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.typeEquipment && (
                    <p className="text-sm text-red-400">{errors.typeEquipment.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateMeeting" className="text-sm font-medium text-gray-600 dark:text-gray-400">Дата встречи *</Label>
                <Input
                  id="dateMeeting"
                  type="datetime-local"
                  {...register('dateMeeting')}
                  className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20 dark:[color-scheme:dark]"
                />
                {errors.dateMeeting && (
                  <p className="text-sm text-red-400">{errors.dateMeeting.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem" className="text-sm font-medium text-gray-600 dark:text-gray-400">Описание проблемы *</Label>
                <Textarea
                  id="problem"
                  {...register('problem')}
                  placeholder="Опишите проблему"
                  rows={2}
                  className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20 resize-none"
                />
                {errors.problem && (
                  <p className="text-sm text-red-400">{errors.problem.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

            {/* Кнопки внизу */}
            <div className="flex justify-end gap-2 sm:gap-3 pt-1 pb-4 px-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-sm border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-sm bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-semibold"
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