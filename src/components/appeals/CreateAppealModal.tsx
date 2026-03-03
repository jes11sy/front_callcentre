'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, PhoneCall, FileText, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';
import { useCities, useRKs, useEquipmentTypes, useOrderStatuses } from '@/hooks/useStaticData';
import { STATUS_LABELS, STATUS_COLORS, STATUS_FLOW } from '@/app/appeals/page';
import type { AppealStatus } from '@/app/appeals/page';

type ModalMode = 'appeal' | 'order';

const appealSchema = z.object({
  phone: z.string().min(1, 'Укажите телефон клиента'),
  clientName: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  cityId: z.string().optional(),
  rkId: z.string().optional(),
  source: z.string().optional(),
  callId: z.string().optional(),
  siteOrderId: z.string().optional(),
  address: z.string().optional(),
  dateMeeting: z.string().optional(),
  typeOrder: z.string().optional(),
  equipmentTypeId: z.string().optional(),
});

type FormData = z.infer<typeof appealSchema>;

interface CallContext {
  phone: string;
  callId: number;
  cityId?: number;
  rkId?: number;
  source?: string | null;
  cityName?: string;
  rkName?: string;
}

interface Appeal {
  id: number;
  phone: string;
  clientName?: string;
  description: string;
  status: string;
  statusId?: number;
  callId?: string | number;
  siteOrderId?: number;
  cityId?: number;
  rkId?: number;
  source?: string;
  cityName?: string;
  rkName?: string;
}

interface CreateAppealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appeal?: Appeal | null;
  initialPhone?: string;
  initialCallId?: number;
  callContext?: CallContext | null;
  onSaved: () => void;
}

export function CreateAppealModal({
  open,
  onOpenChange,
  appeal,
  initialPhone,
  initialCallId,
  callContext,
  onSaved,
}: CreateAppealModalProps) {
  const { theme } = useDesignStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';
  const isEdit = !!appeal;
  const isFromCall = !!callContext;

  const [mode, setMode] = useState<ModalMode>('appeal');

  const { data: cities = [] } = useCities();
  const { data: rks = [] } = useRKs();
  const { data: equipmentTypes = [] } = useEquipmentTypes();
  const { data: orderStatuses = [] } = useOrderStatuses('order');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(appealSchema),
    defaultValues: { status: 'new' },
  });

  useEffect(() => {
    if (open) {
      setMode('appeal');
      if (appeal) {
        reset({
          phone: appeal.phone,
          clientName: appeal.clientName || '',
          description: appeal.description,
          status: appeal.status,
          cityId: appeal.cityId ? String(appeal.cityId) : '',
          rkId: appeal.rkId ? String(appeal.rkId) : '',
          source: appeal.source || '',
          callId: appeal.callId ? String(appeal.callId) : '',
          siteOrderId: appeal.siteOrderId ? String(appeal.siteOrderId) : '',
          address: '',
          dateMeeting: '',
          typeOrder: '',
          equipmentTypeId: '',
        });
      } else if (callContext) {
        reset({
          phone: callContext.phone,
          clientName: '',
          description: '',
          status: 'new',
          cityId: callContext.cityId ? String(callContext.cityId) : '',
          rkId: callContext.rkId ? String(callContext.rkId) : '',
          source: callContext.source || '',
          callId: String(callContext.callId),
          siteOrderId: '',
          address: '',
          dateMeeting: '',
          typeOrder: 'Впервые',
          equipmentTypeId: '',
        });
      } else {
        reset({
          phone: initialPhone || '',
          clientName: '',
          description: '',
          status: 'new',
          cityId: '',
          rkId: '',
          source: '',
          callId: initialCallId ? String(initialCallId) : '',
          siteOrderId: '',
          address: '',
          dateMeeting: '',
          typeOrder: 'Впервые',
          equipmentTypeId: '',
        });
      }
    }
  }, [open, appeal, initialPhone, initialCallId, callContext, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (mode === 'order') {
        const callIdNum = data.callId ? Number(data.callId) : undefined;
        const orderPayload = {
          callIds: callIdNum ? [callIdNum] : [],
          rkId: data.rkId ? Number(data.rkId) : 1,
          cityId: data.cityId ? Number(data.cityId) : 1,
          clientName: data.clientName || '',
          address: data.address || '',
          dateMeeting: data.dateMeeting || undefined,
          equipmentTypeId: data.equipmentTypeId ? Number(data.equipmentTypeId) : undefined,
          description: data.description || undefined,
          source: data.source || undefined,
          operatorId: user?.id || 0,
        };
        const response = await api.post('/orders/from-call', orderPayload);
        return response.data;
      } else {
        const payload: Record<string, unknown> = {
          phone: data.phone,
          clientName: data.clientName || undefined,
          description: data.description || undefined,
          status: data.status,
          cityId: data.cityId ? Number(data.cityId) : undefined,
          rkId: data.rkId ? Number(data.rkId) : undefined,
          source: data.source || undefined,
          callId: data.callId || undefined,
          siteOrderId: data.siteOrderId ? Number(data.siteOrderId) : undefined,
        };
        if (isEdit && appeal) {
          const response = await api.patch(`/appeals/${appeal.id}`, payload);
          return response.data;
        } else {
          const response = await api.post('/appeals', payload);
          return response.data;
        }
      }
    },
    onSuccess: (data) => {
      if (mode === 'order') {
        toast.success(data?.message || 'Заказ создан');
      } else {
        toast.success(isEdit ? 'Обращение обновлено' : 'Обращение создано');
      }
      onSaved();
    },
    onError: () => {
      toast.error(mode === 'order' ? 'Ошибка при создании заказа' : 'Ошибка при сохранении обращения');
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode === 'order') {
      if (!data.cityId) {
        toast.error('Укажите город для заказа');
        return;
      }
      if (!data.clientName) {
        toast.error('Укажите имя клиента для заказа');
        return;
      }
      if (!data.address) {
        toast.error('Укажите адрес для заказа');
        return;
      }
      if (!data.dateMeeting) {
        toast.error('Укажите дату встречи для заказа');
        return;
      }
    }
    saveMutation.mutate(data);
  };

  if (!open) return null;

  const inputCls = `${isDark ? 'bg-[#1e2530] border-gray-600 text-gray-100 placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:border-[#FEC004] focus-visible:ring-0 focus-visible:border-[#FEC004]`;
  const labelCls = `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  const errorCls = 'text-xs text-red-400 mt-1';
  const selectTriggerCls = `h-9 mt-1 ${isDark ? 'bg-[#1e2530] border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} focus:border-[#FEC004] focus-visible:ring-0`;
  const selectContentCls = isDark ? 'bg-[#252d3a] border-gray-600' : 'bg-white border-gray-200';
  const selectItemCls = isDark ? 'text-gray-200' : 'text-gray-700';
  const sectionCls = `text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`;

  const sourceParts: string[] = [];
  if (callContext?.cityName) sourceParts.push(callContext.cityName);
  if (callContext?.rkName) sourceParts.push(callContext.rkName);
  if (callContext?.source) sourceParts.push(callContext.source);

  const currentStatus = watch('status') as AppealStatus;
  const watchCityId = watch('cityId');
  const watchRkId = watch('rkId');
  const watchTypeOrder = watch('typeOrder');
  const watchEquipmentTypeId = watch('equipmentTypeId');

  const isOrder = mode === 'order';

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center sm:justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`w-full sm:max-w-xl rounded-t-xl sm:rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] ${
          isDark ? 'bg-[#1e2530] border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700 bg-[#252d3a]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isFromCall && <PhoneCall className="h-4 w-4 text-[#FEC004]" />}
              <h2 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {isEdit
                  ? `Обращение #${appeal.id}`
                  : isFromCall
                    ? 'Входящий звонок'
                    : 'Новое обращение'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={`h-8 w-8 p-0 ${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isFromCall && sourceParts.length > 0 && (
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Источник: <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{sourceParts.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Mode toggle */}
        {!isEdit && (
          <div className={`px-5 pt-4 pb-0`}>
            <div className={`flex rounded-lg p-1 ${isDark ? 'bg-[#252d3a]' : 'bg-gray-100'}`}>
              <button
                type="button"
                onClick={() => setMode('appeal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'appeal'
                    ? `${isDark ? 'bg-[#1e2530] text-[#FEC004] shadow-sm' : 'bg-white text-gray-900 shadow-sm'}`
                    : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <FileText className="h-4 w-4" />
                Обращение
              </button>
              <button
                type="button"
                onClick={() => setMode('order')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === 'order'
                    ? `${isDark ? 'bg-[#1e2530] text-[#FEC004] shadow-sm' : 'bg-white text-gray-900 shadow-sm'}`
                    : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Заказ
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="px-5 py-4 space-y-4">

            {/* Контакт */}
            <div>
              <p className={sectionCls}>Контакт</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelCls}>Телефон *</Label>
                  <Input
                    {...register('phone')}
                    placeholder="+7 999 000-00-00"
                    readOnly={isFromCall}
                    className={`mt-1 ${inputCls} ${isFromCall ? 'opacity-70' : ''}`}
                  />
                  {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
                </div>
                <div>
                  <Label className={labelCls}>Имя клиента{isOrder ? ' *' : ''}</Label>
                  <Input
                    {...register('clientName')}
                    placeholder="Имя клиента"
                    className={`mt-1 ${inputCls}`}
                    autoFocus={isFromCall}
                  />
                </div>
              </div>
            </div>

            {/* Источник */}
            <div>
              <p className={sectionCls}>Источник</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelCls}>Город{isOrder ? ' *' : ''}</Label>
                  <Select value={watchCityId || 'none'} onValueChange={(v) => setValue('cityId', v === 'none' ? '' : v)}>
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="Город" />
                    </SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)} className={selectItemCls}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelCls}>РК</Label>
                  <Select value={watchRkId || 'none'} onValueChange={(v) => setValue('rkId', v === 'none' ? '' : v)}>
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="РК" />
                    </SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                      {rks.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)} className={selectItemCls}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelCls}>Источник</Label>
                  <Input
                    {...register('source')}
                    placeholder="Авито, сайт..."
                    className={`mt-1 ${inputCls}`}
                  />
                </div>
              </div>
            </div>

            {/* Статус — только для обращения */}
            {!isOrder && (
              <div>
                <p className={sectionCls}>Статус</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setValue('status', s)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                        currentStatus === s
                          ? `${STATUS_COLORS[s]} ring-1 ring-offset-1 ${isDark ? 'ring-offset-[#1e2530]' : 'ring-offset-white'} ring-[#FEC004]`
                          : `${STATUS_COLORS[s]} opacity-50 hover:opacity-80`
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Детали заказа — только для заказа */}
            {isOrder && (
              <div>
                <p className={sectionCls}>Детали заказа</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className={labelCls}>Тип заказа</Label>
                      <Select value={watchTypeOrder || 'Впервые'} onValueChange={(v) => setValue('typeOrder', v)}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Тип заказа" />
                        </SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          <SelectItem value="Впервые" className={selectItemCls}>Впервые</SelectItem>
                          <SelectItem value="Повтор" className={selectItemCls}>Повтор</SelectItem>
                          <SelectItem value="Гарантия" className={selectItemCls}>Гарантия</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={labelCls}>Тип техники</Label>
                      <Select value={watchEquipmentTypeId || 'none'} onValueChange={(v) => setValue('equipmentTypeId', v === 'none' ? '' : v)}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Не указано" />
                        </SelectTrigger>
                        <SelectContent className={selectContentCls}>
                          <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                          {equipmentTypes.map((et) => (
                            <SelectItem key={et.id} value={String(et.id)} className={selectItemCls}>{et.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className={labelCls}>Адрес *</Label>
                    <Input
                      {...register('address')}
                      placeholder="Адрес клиента"
                      className={`mt-1 ${inputCls}`}
                    />
                  </div>
                  <div>
                    <Label className={labelCls}>Дата встречи *</Label>
                    <Input
                      type="datetime-local"
                      {...register('dateMeeting')}
                      className={`mt-1 ${inputCls} ${isDark ? '[color-scheme:dark]' : ''}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Примечание */}
            <div>
              <Label className={labelCls}>Примечание</Label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder="Описание, детали разговора..."
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
              />
            </div>

            {/* Привязки */}
            <div>
              <p className={sectionCls}>Привязки</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelCls}>ID звонка</Label>
                  <Input
                    {...register('callId')}
                    placeholder="123"
                    readOnly={isFromCall}
                    className={`mt-1 ${inputCls} ${isFromCall ? 'opacity-70' : ''}`}
                  />
                </div>
                <div>
                  <Label className={labelCls}>ID заявки с сайта</Label>
                  <Input {...register('siteOrderId')} placeholder="456" type="number" className={`mt-1 ${inputCls}`} />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 px-5 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className={isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-semibold"
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? 'Сохранить' : isOrder ? 'Создать заказ' : 'Создать обращение'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
