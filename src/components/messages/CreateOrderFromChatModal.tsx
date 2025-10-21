'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2,
  Plus,
  MessageSquare,
  MapPin,
  Clock,
  User,
  Phone,
  FileText,
  Settings
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';

const orderSchema = z.object({
  city: z.string().min(1, 'Город обязателен'),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']).refine((val) => val !== undefined, {
    message: 'Выберите тип заявки'
  }),
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  phone: z.string().min(1, 'Номер телефона обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  dateMeeting: z.string().min(1, 'Дата встречи обязательна'),
  typeEquipment: z.enum(['КП', 'БТ', 'МНЧ']).refine((val) => val !== undefined, {
    message: 'Выберите тип техники'
  }),
  problem: z.string().min(1, 'Описание проблемы обязательно')
});

type OrderFormData = z.infer<typeof orderSchema>;

interface AvitoChat {
  id: string;
  avitoAccountName: string;
  city: string;
  lastMessageTime?: number;
  context?: {
    clientName?: string;
    phone?: string;
    address?: string;
  };
}

interface CreateOrderFromChatModalProps {
  chat: AvitoChat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: unknown) => void;
}

export function CreateOrderFromChatModal({ 
  chat, 
  open, 
  onOpenChange, 
  onOrderCreated 
}: CreateOrderFromChatModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      typeOrder: 'Впервые',
      typeEquipment: 'КП'
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
    if (!chat) return;

    try {
      setIsSubmitting(true);

      const orderData = {
        chatId: chat.id,
        rk: 'Авито',
        city: data.city,
        avitoName: chat.avitoAccountName,
        avitoChatId: chat.id,
        typeOrder: data.typeOrder,
        clientName: data.clientName,
        phone: data.phone,
        address: data.address,
        dateMeeting: data.dateMeeting,
        typeEquipment: data.typeEquipment,
        problem: data.problem
      };

      const response = await authApi.post('/orders/from-chat', orderData);

      if (response.data.success) {
        toast.success('Заказ успешно создан!');
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

  // Автозаполнение формы при изменении чата
  React.useEffect(() => {
    if (chat && open) {
      setValue('city', chat.city);
      // Берем имя клиента из users[0].name (первый пользователь в чате)
      const clientName = chat.users && chat.users.length > 0 ? chat.users[0].name : '';
      setValue('clientName', clientName);
      setValue('phone', chat.context?.phone || '');
      setValue('address', chat.context?.address || '');
    }
  }, [chat, open, setValue]);

  if (!chat) return null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#0f0f23] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] w-[90vw] max-w-5xl h-[95vh] flex flex-col rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/30">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#FFD700]">
            <MessageSquare className="h-5 w-5 text-[#FFD700]" />
            Создать заказ из чата
          </h2>
          <button
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Информация о чате */}
          <div className="p-2">
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold text-[#FFD700] flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Информация о чате
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#FFD700]" />
                      Chat ID
                    </Label>
                    <div className="text-white text-sm">{chat.id}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-[#FFD700]" />
                      Имя клиента
                    </Label>
                    <div className="text-white text-sm">{chat.users && chat.users.length > 0 ? chat.users[0].name : 'Не указано'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#FFD700]" />
                    Имя аккаунта Авито
                  </Label>
                  <div className="text-white text-sm">{chat.avitoAccountName}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-2 space-y-1">
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
                    <Label htmlFor="rk" className="text-sm font-medium text-gray-300">РК</Label>
                    <Input
                      id="rk"
                      value="Авито"
                      readOnly
                      className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                    />
                  </div>
                  <div className="space-y-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Информация о клиенте */}
            <Card className="bg-[#17212b] border-[#FFD700]/30">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold text-[#FFD700] flex items-center gap-2">
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
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="Введите номер телефона"
                      className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
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
                <CardTitle className="text-base font-semibold text-[#FFD700] flex items-center gap-2">
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
                  <div className="space-y-2">
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