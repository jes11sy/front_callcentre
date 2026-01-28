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
import api from '@/lib/api';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0f0f23] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] w-[90vw] max-w-5xl h-[95vh] flex flex-col rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/30">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#FFD700]">
            <Plus className="h-5 w-5 text-[#FFD700]" />
            Создать заказ из заявки сайта
            {siteOrder && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                (Заявка #{siteOrder.id})
              </span>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10 rounded flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
            {/* Основная информация */}
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold text-[#FFD700] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="rk" className="text-sm font-medium text-gray-300">Рекламная Компания *</Label>
                    <Controller
                      name="rk"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&>span]:data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Выберите РК" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                            {RK_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-white hover:bg-[#FFD700]/10">
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
                    <Label htmlFor="city" className="text-sm font-medium text-gray-300">Город *</Label>
                    <Controller
                      name="city"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&>span]:data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Выберите город" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                            {CITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-white hover:bg-[#FFD700]/10">
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
                    <Label htmlFor="avitoName" className="text-sm font-medium text-gray-300">Источник</Label>
                    <Controller
                      name="avitoName"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&>span]:data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Выберите источник" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                            {SOURCE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-white hover:bg-[#FFD700]/10">
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
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold text-[#FFD700] flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-sm font-medium text-gray-300">Имя клиента *</Label>
                    <Input
                      id="clientName"
                      {...register('clientName')}
                      placeholder="Введите имя клиента"
                      className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                    />
                    {errors.clientName && (
                      <p className="text-sm text-red-400">{errors.clientName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-300">Телефон *</Label>
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
                          className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-400">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-300">Адрес *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Введите адрес"
                    className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-400">{errors.address.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Детали заказа */}
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold text-[#FFD700] flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Детали заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="typeOrder" className="text-sm font-medium text-gray-300">Тип заказа *</Label>
                    <Controller
                      name="typeOrder"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&>span]:data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Выберите тип заказа" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                            <SelectItem value="Впервые" className="text-white hover:bg-[#FFD700]/10">Впервые</SelectItem>
                            <SelectItem value="Повтор" className="text-white hover:bg-[#FFD700]/10">Повтор</SelectItem>
                            <SelectItem value="Гарантия" className="text-white hover:bg-[#FFD700]/10">Гарантия</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.typeOrder && (
                      <p className="text-sm text-red-400">{errors.typeOrder.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typeEquipment" className="text-sm font-medium text-gray-300">Тип техники *</Label>
                    <Controller
                      name="typeEquipment"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&>span]:data-[placeholder]:text-gray-400">
                            <SelectValue placeholder="Выберите тип техники" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                            <SelectItem value="КП" className="text-white hover:bg-[#FFD700]/10">КП</SelectItem>
                            <SelectItem value="БТ" className="text-white hover:bg-[#FFD700]/10">БТ</SelectItem>
                            <SelectItem value="МНЧ" className="text-white hover:bg-[#FFD700]/10">МНЧ</SelectItem>
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
                  <Label htmlFor="dateMeeting" className="text-sm font-medium text-gray-300">Дата встречи *</Label>
                  <Input
                    id="dateMeeting"
                    type="datetime-local"
                    {...register('dateMeeting')}
                    className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                  />
                  {errors.dateMeeting && (
                    <p className="text-sm text-red-400">{errors.dateMeeting.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="problem" className="text-sm font-medium text-gray-300">Описание проблемы *</Label>
                  <Textarea
                    id="problem"
                    {...register('problem')}
                    placeholder="Опишите проблему"
                    rows={2}
                    className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20 resize-none"
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
                className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-200"
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
