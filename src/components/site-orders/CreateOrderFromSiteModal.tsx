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
  Settings
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import api from '@/lib/api';
import { useCities, useEquipmentTypes, useRKs } from '@/hooks/useStaticData';
import type { SiteOrder } from '@/types/site-orders';
import { notifyApiError } from '@/lib/error-handling';
import {
  getFormDateFieldClass,
  getFormFieldClass,
  getFormSelectContentClass,
  getFormSelectItemClass,
  getFormSelectTriggerClass,
} from '@/components/ui/form-styles';

const orderSchema = z.object({
  rkId: z.number().min(1, 'Рекламная Компания обязательна'),
  cityId: z.number().min(1, 'Город обязателен'),
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
  equipmentTypeId: z.number().min(1, 'Тип техники обязателен'),
  comment: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

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

  const { data: availableCities = [] } = useCities();
  const { data: availableEquipmentTypes = [] } = useEquipmentTypes();
  const { data: availableRKs = [] } = useRKs();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rkId: 0,
      cityId: 0,
      phone: '',
      typeOrder: 'Впервые',
      clientName: '',
      address: '',
      dateMeeting: '',
      equipmentTypeId: 0,
      comment: ''
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = form;

  useEffect(() => {
    if (siteOrder && open) {
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
      
      const cityName = siteOrder.city?.name;
      const cityMatch = cityName
        ? availableCities.find((c: { id: number; name: string }) =>
          c.name.toLowerCase() === cityName.toLowerCase()
        )
        : undefined;
      if (cityMatch) {
        setValue('cityId', cityMatch.id);
      }

      if (siteOrder.comment) {
        setValue('comment', siteOrder.comment);
      }
    }
  }, [siteOrder, open, setValue, availableCities]);

  const onSubmit = async (data: OrderFormData) => {
    if (!siteOrder) return;

    try {
      setIsSubmitting(true);

      const response = await api.post('/orders', {
        ...data,
        operatorId: user?.id || 0
      });

      const orderId = response.data.order?.id || response.data.id;

      if (orderId) {
        await api.patch(`/site-orders/${siteOrder.id}/link-order`, { orderId });
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['site-orders'] });
      toast.success('Заказ успешно создан');
      handleClose();
      onOrderCreated?.();
    } catch (error) {
      notifyApiError(error, 'Ошибка при создании заказа', 'CreateOrderFromSiteModal.onSubmit');
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
  const selectTriggerClass = getFormSelectTriggerClass(isDark, 'md');
  const selectContentClass = getFormSelectContentClass(isDark);
  const selectItemClass = getFormSelectItemClass(isDark);
  const inputClass = getFormFieldClass(isDark, 'md');
  const dateInputClass = getFormDateFieldClass(isDark, 'md');


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#f5f5f7] dark:bg-[#111113] border border-black/[0.08] dark:border-white/10 shadow-xl w-[90vw] max-w-5xl h-[95vh] flex flex-col rounded-[20px] font-myriad">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
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
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 rounded flex items-center justify-center"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
            {/* Основная информация */}
            <Card className="bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <FileText className="h-5 w-5 text-[#0a4f42] dark:text-white/80" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="rkId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Рекламная Компания *</Label>
                    <Controller
                      name="rkId"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите РК" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {availableRKs.map((rk: { id: number; name: string }) => (
                              <SelectItem key={rk.id} value={rk.id.toString()} className={selectItemClass}>
                                {rk.name}
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
                    <Label htmlFor="cityId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Город *</Label>
                    <Controller
                      name="cityId"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите город" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {availableCities.map((city: { id: number; name: string }) => (
                              <SelectItem key={city.id} value={city.id.toString()} className={selectItemClass}>
                                {city.name}
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
                </div>
              </CardContent>
            </Card>

            {/* Информация о клиенте */}
            <Card className="bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="h-5 w-5 text-[#0a4f42] dark:text-white/80" />
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
            <Card className="bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Settings className="h-5 w-5 text-[#0a4f42] dark:text-white/80" />
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
                    <Label htmlFor="equipmentTypeId" className="text-sm font-medium text-gray-600 dark:text-gray-400">Тип техники *</Label>
                    <Controller
                      name="equipmentTypeId"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите тип техники" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {availableEquipmentTypes.map((et: { id: number; name: string }) => (
                              <SelectItem key={et.id} value={et.id.toString()} className={selectItemClass}>{et.name}</SelectItem>
                            ))}
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
                  <Label htmlFor="dateMeeting" className="text-sm font-medium text-gray-600 dark:text-gray-400">Дата встречи *</Label>
                  <Input
                    id="dateMeeting"
                    type="datetime-local"
                    {...register('dateMeeting')}
                    className={dateInputClass}
                  />
                  {errors.dateMeeting && (
                    <p className="text-sm text-red-400">{errors.dateMeeting.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-sm font-medium text-gray-600 dark:text-gray-400">Комментарий</Label>
                  <Textarea
                    id="comment"
                    {...register('comment')}
                    placeholder="Комментарий к заказу"
                    rows={2}
                    className={`${inputClass} h-auto resize-none`}
                  />
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
                className={isDark ? 'bg-white hover:bg-gray-100 text-[#111113] font-semibold' : 'bg-[#0a4f42] hover:bg-[#083f35] text-white font-semibold'}
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
