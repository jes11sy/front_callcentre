'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { useCities, useEquipmentTypes, useRKs } from '@/hooks/useStaticData';
import { CallHistoryPanel, OrderHistoryPanel, AudioPlayerBar } from './create-order';
import {
  getFormDateFieldClass,
  getFormFieldClass,
  getFormSelectContentClass,
  getFormSelectItemClass,
  getFormSelectTriggerClass,
} from '@/components/ui/form-styles';

const orderSchema = z.object({
  rkId: z.number().optional(),
  cityId: z.number().min(1, 'Город обязателен'),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']),
  clientName: z.string().min(1, 'Введите имя клиента'),
  address: z.string().min(1, 'Введите адрес'),
  dateMeeting: z.string().min(1, 'Выберите дату встречи'),
  equipmentTypeId: z.number().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Call {
  id: number;
  rkId?: number;
  rk?: { id: number; name: string };
  cityId?: number;
  city?: { id: number; name: string };
  phoneClient: string;
  phoneAts: string;
  createdAt: string;
  duration?: number;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  callDirection: 'inbound' | 'outbound' | 'callback';
  masterId?: number | null;
  recordingPath?: string;
  operator?: { id: number; name: string; login: string };
  avito?: { id: number; name: string };
}

interface Order {
  id: number;
  clientName: string;
  cityId?: number;
  city?: { id: number; name: string };
  statusId?: number;
  status?: { id: number; name: string; code: string };
  dateMeeting: string;
  equipmentTypeId?: number;
  equipmentType?: { id: number; name: string };
  typeOrder?: string;
  createdAt: string;
  rkId?: number;
  rk?: { id: number; name: string };
  address?: string;
  result?: number;
  master?: { id: number; name: string };
}

interface CreateOrderModalProps {
  call: Call | null;
  callGroup?: Call[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (order: { id?: string | number }) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPhoneDisplay = (phoneClient: string) => {
  if (!phoneClient) return 'Неизвестно';
  if (phoneClient.toLowerCase().includes('sip:')) {
    const match = phoneClient.match(/sip:([^@]+)@/i);
    if (match) return match[1].split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return phoneClient;
  }
  const digits = phoneClient.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  return phoneClient;
};

export function CreateOrderModal({
  call,
  callGroup = [],
  open,
  onOpenChange,
  onOrderCreated
}: CreateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const { data: availableCities = [] } = useCities();
  const { data: availableEquipmentTypes = [] } = useEquipmentTypes();
  const { data: availableRKs = [] } = useRKs();

  // Audio player state
  const [playingCallId, setPlayingCallId] = useState<number | null>(null);
  const [playingCall, setPlayingCall] = useState<Call | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const { user } = useAuthStore();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const fieldClass = getFormFieldClass(isDark, 'sm');
  const dateFieldClass = getFormDateFieldClass(isDark, 'sm');
  const selectTriggerClass = getFormSelectTriggerClass(isDark, 'sm');
  const selectContentClass = `${getFormSelectContentClass(isDark, 'z-[10000]')} max-h-60`;
  const selectContentClassNoCap = getFormSelectContentClass(isDark, 'z-[10000]');
  const selectItemClass = getFormSelectItemClass(isDark);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rkId: call?.rkId,
      cityId: call?.cityId,
      typeOrder: 'Впервые',
      equipmentTypeId: undefined,
      clientName: '',
      address: '',
      dateMeeting: '',
    }
  });

  const { register, handleSubmit, setValue, control, formState: { errors }, reset } = form;

  useEffect(() => {
    const loadOrderHistory = async () => {
      if (!call?.phoneClient || !open) return;
      try {
        setOrderHistoryLoading(true);
        const response = await authApi.get(`/orders/by-phone/${encodeURIComponent(call.phoneClient)}`);
        if (response.data.success) setOrderHistory(response.data.data || []);
      } catch { setOrderHistory([]); }
      finally { setOrderHistoryLoading(false); }
    };
    loadOrderHistory();
  }, [call?.phoneClient, open]);

  useEffect(() => {
    const loadCallHistory = async () => {
      if (!call?.phoneClient || !open) return;
      try {
        setCallHistoryLoading(true);
        const response = await authApi.get(`/calls/by-phone/${encodeURIComponent(call.phoneClient)}`);
        if (response.data.success) setCallHistory(response.data.data || []);
      } catch {
        setCallHistory(callGroup.length > 0 ? callGroup : (call ? [call] : []));
      } finally { setCallHistoryLoading(false); }
    };
    loadCallHistory();
  }, [call?.phoneClient, open, call, callGroup]);

  const handlePlayRecording = async (callItem: Call) => {
    if (!callItem.recordingPath) return;
    if (playingCallId === callItem.id) { handleClosePlayer(); return; }
    try {
      setAudioLoading(true);
      setPlayingCallId(callItem.id);
      setPlayingCall(callItem);
      const response = await authApi.get(`/recordings/call/${callItem.id}/download`);
      if (response.data.success && response.data.url) setAudioUrl(response.data.url);
      else throw new Error(response.data.message || 'Не удалось получить URL записи');
    } catch { handleClosePlayer(); }
    finally { setAudioLoading(false); }
  };

  const handleClosePlayer = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingCallId(null);
    setPlayingCall(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!call) return;
    try {
      setIsSubmitting(true);
      const orderData = {
        callIds: callGroup.length > 0 ? callGroup.map(c => c.id) : [call.id],
        rkId: data.rkId,
        cityId: data.cityId,
        typeOrder: data.typeOrder,
        clientName: data.clientName,
        address: data.address,
        dateMeeting: data.dateMeeting,
        equipmentTypeId: data.equipmentTypeId,
        operatorId: user?.id || 0
      };
      const response = await authApi.post('/orders/from-call', orderData);
      if (response.data.success) {
        toast.success(response.data.message || 'Заказ успешно создан!');
        onOrderCreated?.(response.data.data);
        handleClose();
      } else {
        throw new Error(response.data.message || 'Ошибка при создании заказа');
      }
    } catch {
      toast.error('Ошибка при создании заказа');
    } finally { setIsSubmitting(false); }
  };

  const handleClose = () => {
    reset();
    setOrderHistory([]);
    onOpenChange(false);
  };

  useEffect(() => {
    if (call && open) {
      setTimeout(() => {
        setValue('rkId', call.rkId ?? undefined);
        setValue('cityId', call.cityId ?? 0);
        setValue('typeOrder', 'Впервые');
        setValue('equipmentTypeId', undefined);
        setValue('clientName', '');
        setValue('address', '');
        setValue('dateMeeting', '');
      }, 0);
    }
  }, [call?.id, open, setValue]);

  if (!call || !open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 lg:p-4">
      <div className="w-full h-full lg:h-auto lg:max-w-5xl lg:max-h-[90vh] lg:rounded-xl overflow-hidden flex flex-col bg-[#F3F3EE] dark:bg-[#1e2530] lg:border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b shrink-0 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold shrink-0 text-gray-900 dark:text-gray-100">Новый заказ</h2>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{call.phoneClient}</span>
              {call.city?.name && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                  <span>{call.city.name}</span>
                </>
              )}
            </div>
            <span className="sm:hidden text-xs font-medium truncate text-gray-600 dark:text-gray-300">{call.phoneClient}</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:max-h-[700px]">
          {/* History panels */}
          <div className="order-2 lg:order-1 lg:w-[420px] border-t lg:border-t-0 lg:border-r flex flex-col overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2530]">
            <CallHistoryPanel
              callHistory={callHistory}
              loading={callHistoryLoading}
              isOpen={showCallHistory}
              onToggle={() => setShowCallHistory(!showCallHistory)}
              currentCallId={call?.id}
              playingCallId={playingCallId}
              onPlayRecording={handlePlayRecording}
              formatDate={formatDate}
              formatDuration={formatDuration}
              formatPhoneDisplay={formatPhoneDisplay}
            />
            <OrderHistoryPanel
              orderHistory={orderHistory}
              loading={orderHistoryLoading}
              isOpen={showOrderHistory}
              onToggle={() => setShowOrderHistory(!showOrderHistory)}
            />
          </div>

          {/* Form */}
          <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <form key={call?.id} onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">РК</Label>
                    <Controller
                      name="rkId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Выберите РК</span>} />
                          </SelectTrigger>
                          <SelectContent className={selectContentClass}>
                            {availableRKs.map((rk: { id: number; name: string }) => (
                              <SelectItem key={rk.id} value={rk.id.toString()} className={selectItemClass}>{rk.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Город *</Label>
                    <Controller
                      name="cityId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Выберите город</span>} />
                          </SelectTrigger>
                          <SelectContent className={selectContentClassNoCap}>
                            {availableCities.map((city: { id: number; name: string }) => (
                              <SelectItem key={city.id} value={city.id.toString()} className={selectItemClass}>{city.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.cityId && <p className="text-xs text-red-400 mt-1">{errors.cityId.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Тип техники</Label>
                    <Controller
                      name="equipmentTypeId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Не указано</span>} />
                          </SelectTrigger>
                          <SelectContent className={selectContentClassNoCap}>
                            {availableEquipmentTypes.map((et: { id: number; name: string }) => (
                              <SelectItem key={et.id} value={et.id.toString()} className={selectItemClass}>{et.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Тип заказа *</Label>
                    <Controller
                      name="typeOrder"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClassNoCap}>
                            <SelectItem value="Впервые" className={selectItemClass}>Впервые</SelectItem>
                            <SelectItem value="Повтор" className={selectItemClass}>Повтор</SelectItem>
                            <SelectItem value="Гарантия" className={selectItemClass}>Гарантия</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.typeOrder && <p className="text-xs text-red-400 mt-1">{errors.typeOrder.message}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Имя клиента *</Label>
                    <Input
                      {...register('clientName')}
                      placeholder="Введите имя"
                      className={`${fieldClass} placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                    />
                    {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>}
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Адрес *</Label>
                    <Input
                      {...register('address')}
                      placeholder="Введите адрес"
                      className={`${fieldClass} placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                    />
                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Дата встречи *</Label>
                    <Input
                      type="datetime-local"
                      {...register('dateMeeting')}
                      className={dateFieldClass}
                    />
                    {errors.dateMeeting && <p className="text-xs text-red-400 mt-1">{errors.dateMeeting.message}</p>}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1 block text-gray-600 dark:text-gray-400">Комментарий</Label>
                  <Textarea
                    {...register('comment' as keyof OrderFormData)}
                    placeholder="Комментарий к заказу..."
                    rows={3}
                    className={`${fieldClass} h-auto resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                  />
                </div>
              </form>
            </ScrollArea>

            {/* Footer */}
            <div className="px-3 sm:px-4 py-3 border-t flex justify-end gap-2 shrink-0 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}
                className="h-9 px-3 sm:px-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}
                className="h-9 px-4 sm:px-5 font-medium text-sm bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /><span className="hidden sm:inline">Создание...</span><span className="sm:hidden">...</span></>
                ) : (
                  <><span className="hidden sm:inline">Создать заказ</span><span className="sm:hidden">Создать</span></>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {playingCall && (
          <AudioPlayerBar
            playingCall={playingCall}
            audioUrl={audioUrl}
            audioLoading={audioLoading}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isDark={isDark}
            audioRef={audioRef}
            onPlayPause={togglePlayPause}
            onSeek={handleSeek}
            onClose={handleClosePlayer}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onEnded={handleClosePlayer}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}
