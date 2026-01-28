'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Loader2,
  Plus,
  X,
  Clock
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

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
  rk: z.enum(RK_OPTIONS),
  avitoName: z.enum(SOURCE_OPTIONS).optional(),
  city: z.enum(CITY_OPTIONS, { message: 'Город обязателен' }),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']),
  clientName: z.string().min(1, 'Введите имя клиента'),
  address: z.string().min(1, 'Введите адрес'),
  dateMeeting: z.string().min(1, 'Выберите дату встречи'),
  typeEquipment: z.enum(['КП', 'БТ', 'МНЧ']),
  problem: z.string().min(1, 'Опишите проблему'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Call {
  id: number;
  rk: string;
  city: string;
  avitoName?: string;
  phoneClient: string;
  phoneAts: string;
  dateCreate: string;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  recordingPath?: string;
  operator: {
    id: number;
    name: string;
    login: string;
  };
  avito?: {
    id: number;
    name: string;
  };
}

interface CreateOrderModalProps {
  call: Call | null;
  callGroup?: Call[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: { id?: string | number }) => void;
}

export function CreateOrderModal({ 
  call, 
  callGroup = [],
  open, 
  onOpenChange, 
  onOrderCreated 
}: CreateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rk: call?.rk && (call.rk === 'Авито' || call.rk === 'Листовка') ? call.rk as 'Авито' | 'Листовка' : 'Авито',
      city: call?.city && CITY_OPTIONS.includes(call.city as typeof CITY_OPTIONS[number]) 
        ? call.city as typeof CITY_OPTIONS[number] 
        : undefined,
      avitoName: call?.avitoName && SOURCE_OPTIONS.includes(call.avitoName as typeof SOURCE_OPTIONS[number]) 
        ? call.avitoName as typeof SOURCE_OPTIONS[number] 
        : undefined,
      typeOrder: 'Впервые',
      typeEquipment: undefined,
      clientName: '',
      address: '',
      dateMeeting: '',
      problem: ''
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset
  } = form;

  const onSubmit = async (data: OrderFormData) => {
    if (!call) return;

    try {
      setIsSubmitting(true);

      const orderData = {
        callIds: callGroup.map(c => c.id),
        rk: data.rk,
        avitoName: data.avitoName,
        city: data.city,
        typeOrder: data.typeOrder,
        clientName: data.clientName,
        address: data.address,
        dateMeeting: data.dateMeeting,
        typeEquipment: data.typeEquipment,
        problem: data.problem,
        operatorNameId: user?.id || 0
      };

      const response = await authApi.post('/orders/from-call', orderData);

      if (response.data.success) {
        toast.success(response.data.message || 'Заказ успешно создан!');
        onOrderCreated?.(response.data.data);
        handleClose();
      } else {
        throw new Error(response.data.message || 'Ошибка при создании заказа');
      }
    } catch (error: unknown) {
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

  // Автозаполнение формы при изменении звонка
  useEffect(() => {
    if (call && open) {
      const rkValue = (call.rk === 'Авито' || call.rk === 'Листовка') ? call.rk as 'Авито' | 'Листовка' : 'Авито';
      const avitoNameValue = call.avitoName && SOURCE_OPTIONS.includes(call.avitoName as typeof SOURCE_OPTIONS[number])
        ? call.avitoName as typeof SOURCE_OPTIONS[number]
        : undefined;
      
      // Используем setTimeout чтобы дать форме инициализироваться
      setTimeout(() => {
        setValue('rk', rkValue);
        setValue('city', call.city || '');
        setValue('avitoName', avitoNameValue);
        setValue('typeOrder', 'Впервые');
        setValue('typeEquipment', 'КП');
        setValue('clientName', '');
        setValue('address', '');
        setValue('dateMeeting', '');
        setValue('problem', '');
      }, 0);
    }
  }, [call?.id, open, setValue]);

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  if (!call || !open) return null;

  const statusColors = {
    answered: 'bg-green-500/20 text-green-400 border-green-500/30',
    missed: 'bg-red-500/20 text-red-400 border-red-500/30',
    busy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    no_answer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const statusLabels = {
    answered: 'Отвечен',
    missed: 'Пропущен',
    busy: 'Занято',
    no_answer: 'Нет ответа'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#17212b] border border-[#FFD700]/40 shadow-[0_0_40px_rgba(255,215,0,0.15)] w-full max-w-lg rounded-xl overflow-hidden">
        {/* Header - компактный */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f23] border-b border-[#FFD700]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Новый заказ</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="h-3 w-3" />
                <span>{call.phoneClient}</span>
                <span className="text-gray-600">•</span>
                <MapPin className="h-3 w-3" />
                <span>{call.city || '—'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info bar */}
        <div className="px-4 py-2 bg-[#0f0f23]/50 border-b border-[#FFD700]/10 flex items-center gap-3 text-xs">
          <Badge variant="outline" className={statusColors[call.status]}>
            {statusLabels[call.status]}
          </Badge>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatDate(call.dateCreate)}</span>
          </div>
          {callGroup.length > 1 && (
            <Badge variant="outline" className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30">
              {callGroup.length} звонков
            </Badge>
          )}
        </div>

        {/* Form */}
        <form key={call?.id} onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Row 1: РК + Город */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">РК *</Label>
              <Controller
                name="rk"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                      <SelectValue placeholder="РК" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                      <SelectItem value="Авито" className="text-white">Авито</SelectItem>
                      <SelectItem value="Листовка" className="text-white">Листовка</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.rk && <p className="text-xs text-red-400 mt-1">{errors.rk.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Город *</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                      <SelectValue placeholder="Город" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                      {CITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="text-white">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
            </div>
          </div>

          {/* Row 2: Источник */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Источник</Label>
            <Controller
              name="avitoName"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="text-white">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[#FFD700]/10 my-1" />

          {/* Row 3: Клиент + Адрес */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Имя клиента *</Label>
              <Input
                {...register('clientName')}
                placeholder="Имя"
                className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500"
              />
              {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Адрес *</Label>
              <Input
                {...register('address')}
                placeholder="Адрес"
                className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500"
              />
              {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Row 4: Тип заказа + Тип техники */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Тип заказа *</Label>
              <Controller
                name="typeOrder"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                      <SelectItem value="Впервые" className="text-white">Впервые</SelectItem>
                      <SelectItem value="Повтор" className="text-white">Повтор</SelectItem>
                      <SelectItem value="Гарантия" className="text-white">Гарантия</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.typeOrder && <p className="text-xs text-red-400 mt-1">{errors.typeOrder.message}</p>}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Тип техники *</Label>
              <Controller
                name="typeEquipment"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                      <SelectValue placeholder="Техника" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                      <SelectItem value="КП" className="text-white">КП</SelectItem>
                      <SelectItem value="БТ" className="text-white">БТ</SelectItem>
                      <SelectItem value="МНЧ" className="text-white">МНЧ</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.typeEquipment && <p className="text-xs text-red-400 mt-1">{errors.typeEquipment.message}</p>}
            </div>
          </div>

          {/* Row 5: Дата встречи */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Дата встречи *</Label>
            <Input
              type="datetime-local"
              {...register('dateMeeting')}
              className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm"
            />
            {errors.dateMeeting && <p className="text-xs text-red-400 mt-1">{errors.dateMeeting.message}</p>}
          </div>

          {/* Row 6: Проблема */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">Проблема *</Label>
            <Textarea
              {...register('problem')}
              placeholder="Опишите проблему..."
              rows={2}
              className="bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500 resize-none"
            />
            {errors.problem && <p className="text-xs text-red-400 mt-1">{errors.problem.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0f0f23] border-t border-[#FFD700]/20 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-gray-400 hover:text-white hover:bg-white/5"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="h-9 px-5 bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0f0f23] font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              'Создать заказ'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}