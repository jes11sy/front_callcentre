'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, PhoneCall, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';
import { useCities, useRKs, useEquipmentTypes } from '@/hooks/useStaticData';
import { STATUS_LABELS, STATUS_FLOW } from '@/app/appeals/page';
import type { AppealStatus } from '@/app/appeals/page';

type ModalMode = 'appeal' | 'order';

const SOURCE_OPTIONS = ['call', 'chat', 'site_order', 'manual'] as const;

const formSchema = z.object({
  phone: z.string().min(1, 'Укажите телефон клиента'),
  clientName: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  cityId: z.string().optional(),
  rkId: z.string().optional(),
  source: z.string().optional(),
  callId: z.string().optional(),
  address: z.string().optional(),
  dateMeeting: z.string().optional(),
  typeOrder: z.string().optional(),
  equipmentTypeId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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
}

interface HistoryOrder {
  id: number;
  phone: string;
  clientName?: string;
  description?: string;
  status?: { code: string; name: string; color?: string };
  statusName?: string;
  statusCode?: string;
  statusColor?: string;
  cityName?: string;
  rkName?: string;
  source?: string;
  address?: string;
  dateMeeting?: string;
  typeOrder?: string;
  createdAt: string;
  city?: { name: string };
  rk?: { name: string };
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
  const clientPhone = callContext?.phone || appeal?.phone || initialPhone || '';

  const { data: historyOrders = [], isLoading: historyLoading } = useQuery<HistoryOrder[]>({
    queryKey: ['order-history', clientPhone],
    queryFn: async () => {
      if (!clientPhone) return [];
      const res = await api.get(`/orders/by-phone/${encodeURIComponent(clientPhone)}`);
      return res.data?.data || [];
    },
    enabled: open && !!clientPhone,
    staleTime: 30_000,
  });

  const initialValues = useMemo<FormData>(() => {
    if (appeal) {
      return {
        phone: appeal.phone,
        clientName: appeal.clientName || '',
        description: appeal.description || '',
        status: appeal.status,
        cityId: appeal.cityId ? String(appeal.cityId) : '',
        rkId: appeal.rkId ? String(appeal.rkId) : '',
        source: appeal.source || '',
        callId: appeal.callId ? String(appeal.callId) : '',
        address: '', dateMeeting: '', typeOrder: 'Впервые', equipmentTypeId: '',
      };
    }
    if (callContext) {
      return {
        phone: callContext.phone || '',
        clientName: '',
        description: '',
        status: 'new',
        cityId: callContext.cityId ? String(callContext.cityId) : '',
        rkId: callContext.rkId ? String(callContext.rkId) : '',
        source: callContext.source || '',
        callId: String(callContext.callId || ''),
        address: '', dateMeeting: '', typeOrder: 'Впервые', equipmentTypeId: '',
      };
    }
    return {
      phone: initialPhone || '',
      clientName: '', description: '', status: 'new',
      cityId: '', rkId: '', source: '',
      callId: initialCallId ? String(initialCallId) : '',
      address: '', dateMeeting: '', typeOrder: 'Впервые', equipmentTypeId: '',
    };
  }, [appeal, callContext, initialPhone, initialCallId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    values: initialValues,
  });

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
        };
        if (isEdit && appeal) {
          return (await api.patch(`/appeals/${appeal.id}`, payload)).data;
        } else {
          return (await api.post('/appeals', payload)).data;
        }
      }
    },
    onSuccess: (data) => {
      toast.success(mode === 'order' ? (data?.message || 'Заказ создан') : (isEdit ? 'Обращение обновлено' : 'Обращение создано'));
      onSaved();
    },
    onError: () => {
      toast.error(mode === 'order' ? 'Ошибка при создании заказа' : 'Ошибка при сохранении обращения');
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode === 'order') {
      if (!data.cityId) { toast.error('Укажите город'); return; }
      if (!data.clientName) { toast.error('Укажите имя клиента'); return; }
      if (!data.address) { toast.error('Укажите адрес'); return; }
      if (!data.dateMeeting) { toast.error('Укажите дату встречи'); return; }
    }
    saveMutation.mutate(data);
  };

  if (!open) return null;

  const inputCls = `${isDark ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/35' : 'bg-white border-[#cfd2d8] text-[#111113] placeholder:text-[#8e8e93]'} rounded-2xl focus:border-[#FEC004] focus-visible:ring-0 focus-visible:border-[#FEC004]`;
  const labelCls = `text-xs ${isDark ? 'text-white/60' : 'text-[#6e6e73]'}`;
  const selectTriggerCls = `h-10 mt-1 rounded-2xl text-sm ${isDark ? 'bg-white/[0.04] border-white/15 text-white' : 'bg-white border-[#cfd2d8] text-[#111113]'} focus:border-[#FEC004] focus-visible:ring-0`;
  const selectContentCls = isDark ? 'bg-[#1e1e20] border-white/10 rounded-2xl' : 'bg-white border-gray-200 rounded-2xl';
  const selectItemCls = isDark ? 'text-white data-[highlighted]:bg-white/10' : 'text-gray-700 data-[highlighted]:bg-black/5';
  const sectionCls = `mb-2 text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-white/45' : 'text-[#6e6e73]'}`;

  const currentStatus = watch('status') as AppealStatus;
  const watchCityId = watch('cityId');
  const watchRkId = watch('rkId');
  const watchSource = watch('source');
  const watchTypeOrder = watch('typeOrder');
  const watchEquipmentTypeId = watch('equipmentTypeId');

  const isOrder = mode === 'order';

  const sourceOptions = [...SOURCE_OPTIONS];
  if (watchSource && !sourceOptions.includes(watchSource)) {
    sourceOptions.unshift(watchSource);
  }

  const citySelectValue = watchCityId || 'none';
  const rkSelectValue = watchRkId || 'none';
  const sourceSelectValue = watchSource || 'none';

  const formatHistoryDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center sm:justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={`w-full sm:max-w-4xl rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-xl flex flex-col sm:flex-row max-h-[92vh] ${
          isDark ? 'bg-[#111113] border border-white/10' : 'bg-[#f5f5f7] border border-black/[0.08]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Form */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className={`px-5 py-4 border-b shrink-0 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-black/[0.08] bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isFromCall && <PhoneCall className="h-4 w-4 text-[#FEC004]" />}
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#111113]'}`}>
                  {isEdit ? `Обращение #${appeal.id}` : isFromCall ? 'Входящий звонок' : 'Новое обращение'}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className={`h-8 w-8 rounded-xl p-0 ${isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-[#6e6e73] hover:text-[#111113] hover:bg-black/[0.04]'}`}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mode toggle */}
          {!isEdit && (
            <div className="px-5 pt-4 pb-0 shrink-0">
              <div className={`flex rounded-2xl p-1 ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
                <button
                  type="button"
                  onClick={() => setMode('appeal')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    mode === 'appeal'
                      ? `${isDark ? 'bg-white text-[#111113] shadow-sm' : 'bg-white text-[#111113] shadow-sm'}`
                      : `${isDark ? 'text-white/65 hover:text-white' : 'text-[#6e6e73] hover:text-[#111113]'}`
                  }`}
                >
                  Обращение
                </button>
                <button
                  type="button"
                  onClick={() => setMode('order')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    mode === 'order'
                      ? `${isDark ? 'bg-white text-[#111113] shadow-sm' : 'bg-white text-[#111113] shadow-sm'}`
                      : `${isDark ? 'text-white/65 hover:text-white' : 'text-[#6e6e73] hover:text-[#111113]'}`
                  }`}
                >
                  Заказ
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
            <div className="px-5 py-4 space-y-4">

              {/* Контакт */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className={labelCls}>Телефон *</Label>
                  <Input {...register('phone')} placeholder="+7 999 000-00-00" readOnly={isFromCall} className={`mt-1 h-10 text-sm ${inputCls} ${isFromCall ? 'opacity-70' : ''}`} />
                  {errors.phone && <p className="text-[10px] text-red-400 mt-0.5">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label className={labelCls}>Имя клиента{isOrder ? ' *' : ''}</Label>
                  <Input {...register('clientName')} placeholder="Имя клиента" className={`mt-1 h-10 text-sm ${inputCls}`} autoFocus={isFromCall} />
                </div>
              </div>

              {/* Источник */}
              <div>
                <p className={sectionCls}>Источник</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label className={labelCls}>Город{isOrder ? ' *' : ''}</Label>
                    <Select value={citySelectValue} onValueChange={(v) => setValue('cityId', v === 'none' ? '' : v)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Город" /></SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                        {watchCityId && watchCityId !== 'none' && !cities.find(c => String(c.id) === watchCityId) && (
                          <SelectItem value={watchCityId} className={selectItemCls}>{callContext?.cityName || `ID ${watchCityId}`}</SelectItem>
                        )}
                        {cities.map((c) => <SelectItem key={c.id} value={String(c.id)} className={selectItemCls}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelCls}>РК</Label>
                    <Select value={rkSelectValue} onValueChange={(v) => setValue('rkId', v === 'none' ? '' : v)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="РК" /></SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                        {watchRkId && watchRkId !== 'none' && !rks.find(r => String(r.id) === watchRkId) && (
                          <SelectItem value={watchRkId} className={selectItemCls}>{callContext?.rkName || `ID ${watchRkId}`}</SelectItem>
                        )}
                        {rks.map((r) => <SelectItem key={r.id} value={String(r.id)} className={selectItemCls}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelCls}>Источник</Label>
                    <Select value={sourceSelectValue} onValueChange={(v) => setValue('source', v === 'none' ? '' : v)}>
                      <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Источник" /></SelectTrigger>
                      <SelectContent className={selectContentCls}>
                        <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                        {sourceOptions.map((s) => <SelectItem key={s} value={s} className={selectItemCls}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Статус — только для обращения */}
              {!isOrder && (
                <div>
                  <p className={sectionCls}>Статус</p>
                  <Select value={currentStatus} onValueChange={(v) => setValue('status', v)}>
                    <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      {STATUS_FLOW.map((s) => <SelectItem key={s} value={s} className={selectItemCls}>{STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Детали заказа */}
              {isOrder && (
                <div>
                  <p className={sectionCls}>Детали заказа</p>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className={labelCls}>Тип заказа</Label>
                        <Select value={watchTypeOrder || 'Впервые'} onValueChange={(v) => setValue('typeOrder', v)}>
                          <SelectTrigger className={selectTriggerCls}><SelectValue /></SelectTrigger>
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
                          <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            <SelectItem value="none" className={selectItemCls}>—</SelectItem>
                            {equipmentTypes.map((et) => <SelectItem key={et.id} value={String(et.id)} className={selectItemCls}>{et.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className={labelCls}>Адрес *</Label>
                      <Input {...register('address')} placeholder="Адрес клиента" className={`mt-1 h-10 text-sm ${inputCls}`} />
                    </div>
                    <div>
                      <Label className={labelCls}>Дата встречи *</Label>
                      <Input type="datetime-local" {...register('dateMeeting')} className={`mt-1 h-10 text-sm ${inputCls} ${isDark ? '[color-scheme:dark]' : ''}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Примечание */}
              <div>
                <Label className={labelCls}>Примечание</Label>
                <textarea {...register('description')} rows={3} placeholder="Детали разговора..." className={`mt-1 w-full rounded-2xl border px-3 py-2 text-sm resize-none ${inputCls}`} />
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end gap-3 px-5 py-4 border-t shrink-0 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/[0.08] bg-white'}`}>
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className={isDark ? 'rounded-xl text-white/65 hover:text-white hover:bg-white/[0.06]' : 'rounded-xl text-[#6e6e73] hover:text-[#111113] hover:bg-black/[0.04]'}>
                Отмена
              </Button>
              <Button type="submit" size="sm" disabled={saveMutation.isPending} className={isDark ? 'rounded-xl bg-white hover:bg-gray-100 text-[#111113] font-semibold' : 'rounded-xl bg-[#FEC004] hover:bg-[#e3ac00] text-[#111113] font-semibold'}>
                {saveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                {isEdit ? 'Сохранить' : isOrder ? 'Создать заказ' : 'Создать обращение'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right: History panel */}
        <div className={`w-full sm:w-72 border-t sm:border-t-0 sm:border-l flex flex-col overflow-hidden shrink-0 ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/[0.08] bg-white/[0.65]'}`}>
          <div className={`px-3 py-3 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-black/[0.08]'}`}>
            <h3 className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-[#3a3a3c]'}`}>
              История по номеру
            </h3>
            {clientPhone && (
              <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-white/45' : 'text-[#8e8e93]'}`}>{clientPhone}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={`h-5 w-5 animate-spin ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            ) : historyOrders.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Нет записей
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {historyOrders.map((order) => {
                  const statusName = order.status?.name || order.statusName || '—';
                  const statusColor = order.status?.color || order.statusColor;
                  const city = order.city?.name || order.cityName;
                  const rk = order.rk?.name || order.rkName;
                  const srcParts = [city, rk, order.source].filter(Boolean);
                  return (
                    <div
                      key={order.id}
                      className={`rounded-lg p-2 text-xs border ${isDark ? 'bg-[#1e2530] border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} transition-colors`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>#{order.id}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={statusColor ? { backgroundColor: statusColor + '20', color: statusColor } : undefined}
                        >
                          {statusName}
                        </span>
                      </div>
                      {order.clientName && (
                        <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{order.clientName}</div>
                      )}
                      {srcParts.length > 0 && (
                        <div className={`text-[10px] mb-0.5 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {srcParts.join(' • ')}
                        </div>
                      )}
                      {order.address && (
                        <div className={`text-[10px] mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{order.address}</div>
                      )}
                      {order.description && (
                        <div className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{order.description}</div>
                      )}
                      <div className={`text-[10px] mt-1 flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {formatHistoryDate(order.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
