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

const orderSchema = z.object({
  rk: z.string().min(1, 'РК обязателен'),
  city: z.string().min(1, 'Город обязателен'),
  avitoName: z.string().optional(),
  phone: z.string().min(1, 'Телефон обязателен'),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']).refine((val) => val !== undefined, {
    message: 'Тип заказа обязателен'
  }),
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  address: z.string().min(1, 'Адрес обязателен'),
  dateMeeting: z.string().min(1, 'Дата встречи обязательна'),
  typeEquipment: z.enum(['КП', 'БТ', 'МНЧ']).refine((val) => val !== undefined, {
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
    formState: { errors },
    reset
  } = form;

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru'}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...data,
          operatorNameId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 0
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании заказа');
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
            Создать новый заказ
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
                  <Label htmlFor="rk" className="text-sm font-medium text-gray-300">РК *</Label>
                  <Input
                    id="rk"
                    {...register('rk')}
                    placeholder="Введите РК"
                    className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
                  />
                  {errors.rk && (
                    <p className="text-sm text-red-400">{errors.rk.message}</p>
                  )}
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
                <div className="space-y-2">
                  <Label htmlFor="avitoName" className="text-sm font-medium text-gray-300">Авито аккаунт</Label>
                  <Input
                    id="avitoName"
                    {...register('avitoName')}
                    placeholder="Имя аккаунта"
                    className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
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
                        <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20">
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
                        <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20">
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