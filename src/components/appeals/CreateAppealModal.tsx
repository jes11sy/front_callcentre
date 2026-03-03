'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import type { Appeal, AppealStatus } from '@/app/appeals/page';
import { STATUS_LABELS, STATUS_COLORS, STATUS_FLOW } from '@/app/appeals/page';

const schema = z.object({
  clientPhone: z.string().min(1, 'Укажите телефон клиента'),
  clientName: z.string().optional(),
  description: z.string().optional(),
  result: z.string().optional(),
  status: z.enum(['new', 'accepted', 'refused', 'spam', 'non_order', 'duplicate', 'callback', 'complaint', 'consultation']),
  callId: z.string().optional(),
  siteOrderId: z.string().optional(),
  orderId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CallContext {
  phone: string;
  callId: number;
  cityId?: number;
  rkId?: number;
  source?: string | null;
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
  const isDark = theme === 'dark';
  const isEdit = !!appeal;
  const isFromCall = !!callContext;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'new',
    },
  });

  useEffect(() => {
    if (open) {
      if (appeal) {
        reset({
          clientPhone: appeal.clientPhone,
          clientName: appeal.clientName || '',
          description: appeal.description,
          result: appeal.result || '',
          status: appeal.status,
          callId: appeal.callId ? String(appeal.callId) : '',
          siteOrderId: appeal.siteOrderId ? String(appeal.siteOrderId) : '',
          orderId: appeal.orderId ? String(appeal.orderId) : '',
        });
      } else if (callContext) {
        reset({
          clientPhone: callContext.phone,
          clientName: '',
          description: '',
          result: '',
          status: 'new',
          callId: String(callContext.callId),
          siteOrderId: '',
          orderId: '',
        });
      } else {
        reset({
          clientPhone: initialPhone || '',
          clientName: '',
          description: '',
          result: '',
          status: 'new',
          callId: initialCallId ? String(initialCallId) : '',
          siteOrderId: '',
          orderId: '',
        });
      }
    }
  }, [open, appeal, initialPhone, initialCallId, callContext, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: Record<string, unknown> = {
        clientPhone: data.clientPhone,
        clientName: data.clientName || undefined,
        description: data.description || undefined,
        result: data.result || undefined,
        status: data.status,
        callId: data.callId ? Number(data.callId) : undefined,
        siteOrderId: data.siteOrderId ? Number(data.siteOrderId) : undefined,
        orderId: data.orderId ? Number(data.orderId) : undefined,
      };
      if (!isEdit && callContext) {
        payload.cityId = callContext.cityId;
        payload.rkId = callContext.rkId;
        payload.source = callContext.source ?? undefined;
      }
      if (isEdit && appeal) {
        const response = await api.patch(`/appeals/${appeal.id}`, payload);
        return response.data;
      } else {
        const response = await api.post('/appeals', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Обращение обновлено' : 'Обращение создано');
      onSaved();
    },
    onError: () => {
      toast.error('Ошибка при сохранении обращения');
    },
  });

  if (!open) return null;

  const inputCls = `${isDark ? 'bg-[#1e2530] border-gray-600 text-gray-100 placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:border-[#FEC004] focus-visible:ring-0 focus-visible:border-[#FEC004]`;
  const labelCls = `text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`;
  const errorCls = 'text-xs text-red-400 mt-1';

  const sourceParts: string[] = [];
  if (callContext?.cityName) sourceParts.push(callContext.cityName);
  if (callContext?.rkName) sourceParts.push(callContext.rkName);
  if (callContext?.source) sourceParts.push(callContext.source);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center sm:justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`w-full sm:max-w-lg rounded-t-xl sm:rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] ${
          isDark ? 'bg-[#1e2530] border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-700 bg-[#252d3a]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isFromCall && <PhoneCall className="h-4 w-4 text-[#FEC004]" />}
              <h2 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {isEdit ? `Обращение #${appeal.id}` : isFromCall ? 'Обращение по звонку' : 'Новое обращение'}
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

          {/* Источник из звонка */}
          {isFromCall && sourceParts.length > 0 && (
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Источник: <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{sourceParts.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="overflow-y-auto flex-1">
          <div className="px-5 py-4 space-y-4">

            {/* Телефон + Имя */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelCls}>Телефон</Label>
                <Input
                  {...register('clientPhone')}
                  placeholder="+7 999 000-00-00"
                  readOnly={isFromCall}
                  className={`mt-1 ${inputCls} ${isFromCall ? 'opacity-70' : ''}`}
                />
                {errors.clientPhone && <p className={errorCls}>{errors.clientPhone.message}</p>}
              </div>
              <div>
                <Label className={labelCls}>Имя</Label>
                <Input
                  {...register('clientName')}
                  placeholder="Имя клиента"
                  className={`mt-1 ${inputCls}`}
                  autoFocus={isFromCall}
                />
              </div>
            </div>

            {/* Статус — кнопками для быстрого выбора */}
            <div>
              <Label className={labelCls}>Статус</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('status', s)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      watch('status') === s
                        ? `${STATUS_COLORS[s]} ring-1 ring-offset-1 ${isDark ? 'ring-offset-[#1e2530]' : 'ring-offset-white'} ring-[#FEC004]`
                        : `${STATUS_COLORS[s]} opacity-50 hover:opacity-80`
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Примечание */}
            <div>
              <Label className={labelCls}>Примечание</Label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder="Примечание..."
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
              />
            </div>

            {/* Расширенные поля — только в режиме редактирования или создания вручную */}
            {!isFromCall && (
              <>
                <div>
                  <Label className={labelCls}>Итог разговора</Label>
                  <textarea
                    {...register('result')}
                    rows={2}
                    placeholder="Чем завершился разговор..."
                    className={`mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none ${inputCls}`}
                  />
                </div>

                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Привязки</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className={labelCls}>ID звонка</Label>
                      <Input {...register('callId')} placeholder="123" type="number" className={`mt-1 ${inputCls}`} />
                    </div>
                    <div>
                      <Label className={labelCls}>ID заявки</Label>
                      <Input {...register('siteOrderId')} placeholder="456" type="number" className={`mt-1 ${inputCls}`} />
                    </div>
                    <div>
                      <Label className={labelCls}>ID заказа</Label>
                      <Input {...register('orderId')} placeholder="789" type="number" className={`mt-1 ${inputCls}`} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Футер */}
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
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
