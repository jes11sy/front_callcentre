'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Settings,
  Loader2,
  Plus,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

// Опции для выпадающих списков
const RK_OPTIONS = ['Авито', 'Листовка'] as const;
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
  city: z.string().min(1, 'Введите город'),
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
      city: call?.city || '',
      avitoName: call?.avitoName && SOURCE_OPTIONS.includes(call.avitoName as typeof SOURCE_OPTIONS[number]) 
        ? call.avitoName as typeof SOURCE_OPTIONS[number] 
        : undefined,
      typeOrder: 'Впервые',
      typeEquipment: 'КП',
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
      
      reset({
        rk: rkValue,
        city: call.city || '',
        avitoName: avitoNameValue,
        typeOrder: 'Впервые',
        typeEquipment: 'КП',
        clientName: '',
        address: '',
        dateMeeting: '',
        problem: ''
      });
    }
  }, [call, open, reset]);

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

  if (!call) return null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0f0f23] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] w-[90vw] max-w-5xl h-[95vh] flex flex-col rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/30">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#FFD700]">
            <Phone className="h-5 w-5 text-[#FFD700]" />
            Создать заказ из звонка
          </h2>
          <button
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10 rounded flex items-center justify-center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Информация о звонке */}
          <div className="p-2">
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold text-[#FFD700] flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Информация о звонке
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#FFD700]" />
                      Телефон
                    </Label>
                    <div className="text-white text-sm">{call.phoneClient}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#FFD700]" />
                      Город
                    </Label>
                    <div className="text-white text-sm">{call.city}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#FFD700]" />
                      Дата
                    </Label>
                    <div className="text-white text-sm">{formatDate(call.dateCreate)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-[#FFD700]" />
                      Статус
                    </Label>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                      call.status === 'answered' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      call.status === 'missed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {call.status === 'answered' ? 'Отвечен' :
                       call.status === 'missed' ? 'Пропущен' :
                       'Занято'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <form key={call?.id} onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
          {/* Основная информация */}
          <Card className="bg-[#17212b] border-[#FFD700]/30">
            <CardHeader className="pb-1">
              <CardTitle className="text-base font-semibold text-[#FFD700] flex items-center gap-2">
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
                      <Select 
                        key={`rk-${call?.id}-${field.value}`}
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20">
                          <SelectValue placeholder="Выберите РК" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                          <SelectItem value="Авито" className="text-white hover:bg-[#FFD700]/10">Авито</SelectItem>
                          <SelectItem value="Листовка" className="text-white hover:bg-[#FFD700]/10">Листовка</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rk && (
                    <p className="text-sm text-red-400">{errors.rk.message}</p>
                  )}
                </div>
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-300">Город *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Введите город"
                  className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#FFD700] flex items-center gap-2">
              <User className="h-5 w-5" />
              Информация о клиенте
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
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
            <div>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#FFD700] flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Детали заказа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="typeOrder" className="text-sm font-medium text-gray-300">Тип заказа *</Label>
                <Controller
                  name="typeOrder"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20">
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
              <div>
                <Label htmlFor="typeEquipment" className="text-sm font-medium text-gray-300">Тип техники *</Label>
                <Controller
                  name="typeEquipment"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20">
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
            <div>
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
            <div>
                <Label htmlFor="problem" className="text-sm font-medium text-gray-300">Описание проблемы *</Label>
              <Textarea
                id="problem"
                {...register('problem')}
                placeholder="Опишите проблему"
                rows={2}
                className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
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