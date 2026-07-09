'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import api from '@/lib/api';

// Опции для выпадающих списков
const RK_OPTIONS = ['Авито', 'Листовка'] as const;
const CITY_OPTIONS = ['Саратов', 'Энгельс', 'Ульяновск', 'Пенза', 'Тольятти', 'Омск', 'Ярославль', 'Липецк'] as const;
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

interface SiteOrder {
  id: number;
  city: string;
  site: string;
  clientName: string;
  phone: string;
  status: string;
  comment: string | null;
}

interface CreateOrderFromSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteOrder: SiteOrder | null;
  onOrderCreated?: () => void;
}

export default function CreateOrderFromSiteModal({ 
  open, 
  onOpenChange, 
  siteOrder,
  onOrderCreated 
}: CreateOrderFromSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rk: undefined,
      city: undefined,
      avitoName: undefined,
      phone: '',
      typeOrder: 'Впервые',
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
    reset,
    setValue
  } = form;

  // Заполняем форму данными из заявки сайта
  useEffect(() => {
    if (siteOrder && open) {
      // Форматируем телефон
      let phone = siteOrder.phone.replace(/\D/g, '');
      if (phone.startsWith('8')) {
        phone = '7' + phone.slice(1);
      } else if (phone.startsWith('9')) {
        phone = '7' + phone;
      } else if (!phone.startsWith('7') && phone.length > 0) {
        phone = '7' + phone;
      }
      if (phone.length > 11) {
        phone = phone.slice(0, 11);
      }

      setValue('clientName', siteOrder.clientName);
      setValue('phone', phone);
      
      // Пробуем установить город если он совпадает
      const cityMatch = CITY_OPTIONS.find(c => 
        c.toLowerCase() === siteOrder.city.toLowerCase()
      );
      if (cityMatch) {
        setValue('city', cityMatch);
      }

      // Используем комментарий как начальное описание проблемы
      if (siteOrder.comment) {
        setValue('problem', siteOrder.comment);
      }
    }
  }, [siteOrder, open, setValue]);

  const onSubmit = async (data: OrderFormData) => {
    if (!siteOrder) return;

    try {
      setIsSubmitting(true);

      // Создаем заказ
      const response = await api.post('/orders', {
        ...data,
        operatorNameId: user?.id || 0
      });

      const orderId = response.data.order?.id || response.data.id;

      // Связываем заявку сайта с заказом
      if (orderId) {
        await api.patch(`/site-orders/${siteOrder.id}/link-order`, { orderId });
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['site-orders'] });
      toast.success('Заказ успешно создан');
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

  // Стили
  const selectTriggerClass = "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0";
  
  const selectContentClass = "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600";
  
  const selectItemClass = "text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100";
  
  const inputClass = "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#F3F3EE] dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 shadow-xl w-[90vw] max-w-5xl h-[95vh] flex flex-col rounded-lg font-myriad">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            Создать заказ из заявки сайта
            {siteOrder && (
              <span className="text-sm font-normal ml-2 text-gray-500 dark:text-gray-400">
                (Заявка #{siteOrder.id})
              </span>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
          >
            <X className="h-4 w-4" />
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
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите РК" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {RK_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className={selectItemClass}>
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
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите город" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {CITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className={selectItemClass}>
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
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите источник" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {SOURCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className={selectItemClass}>
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
                      className={inputClass}
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
                            let input = e.target.value.replace(/\D/g, '');
                            
                            if (input.startsWith('8')) {
                              input = '7' + input.slice(1);
                            } else if (input.startsWith('9')) {
                              input = '7' + input;
                            } else if (input.length > 0 && !input.startsWith('7')) {
                              input = '7' + input;
                            }
                            
                            if (input.length > 11) {
                              input = input.slice(0, 11);
                            }
                            
                            field.onChange(input);
                          }}
                          placeholder="Введите номер телефона"
                          className={inputClass}
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
                    className={inputClass}
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
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите тип заказа" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            <SelectItem value="Впервые" className={selectItemClass}>Впервые</SelectItem>
                            <SelectItem value="Повтор" className={selectItemClass}>Повтор</SelectItem>
                            <SelectItem value="Гарантия" className={selectItemClass}>Гарантия</SelectItem>
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
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите тип техники" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            <SelectItem value="КП" className={selectItemClass}>КП</SelectItem>
                            <SelectItem value="БТ" className={selectItemClass}>БТ</SelectItem>
                            <SelectItem value="МНЧ" className={selectItemClass}>МНЧ</SelectItem>
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
                    className={`${inputClass} dark:[color-scheme:dark]`}
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
            <div className="flex justify-end gap-3 pt-1 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать заказ
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
