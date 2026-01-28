'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  MapPin, 
  Loader2,
  Plus,
  X,
  Clock,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
  User
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

// Статические опции
const CITY_OPTIONS = ['Саратов', 'Энгельс', 'Ульяновск', 'Пенза', 'Тольятти', 'Омск', 'Ярославль'] as const;
const DIRECTION_OPTIONS = ['Не указано', 'КП', 'БТ', 'МНЧ'] as const;

const orderSchema = z.object({
  rk: z.string().optional(),
  avitoName: z.string().optional(),
  city: z.enum(CITY_OPTIONS, { message: 'Город обязателен' }),
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']),
  clientName: z.string().min(1, 'Введите имя клиента'),
  address: z.string().min(1, 'Введите адрес'),
  dateMeeting: z.string().min(1, 'Выберите дату встречи'),
  typeEquipment: z.string().optional(),
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
  duration?: number;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  callDirection?: 'incoming' | 'outgoing';
  recordingPath?: string;
  operator?: {
    id: number;
    name: string;
    login: string;
  };
  avito?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  clientName: string;
  city: string;
  status: string;
  dateMeeting: string;
  typeEquipment: string;
  problem?: string;
  createdAt: string;
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
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState(true);
  const [sources, setSources] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [playingCallId, setPlayingCallId] = useState<number | null>(null);
  const { user } = useAuthStore();

  // Загрузка источников и РК из БД
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [sourcesRes, campaignsRes] = await Promise.all([
          authApi.get('/phones/sources'),
          authApi.get('/phones/campaigns')
        ]);
        
        if (sourcesRes.data.success) {
          setSources(sourcesRes.data.data || []);
        }
        if (campaignsRes.data.success) {
          setCampaigns(campaignsRes.data.data || []);
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open]);

  // Проверяем, есть ли значение в списке
  const getDefaultRk = (rkValue?: string) => {
    if (rkValue && campaigns.includes(rkValue)) {
      return rkValue;
    }
    return 'Не указано';
  };

  const getDefaultSource = (sourceValue?: string) => {
    if (sourceValue && sources.includes(sourceValue)) {
      return sourceValue;
    }
    return 'Не указано';
  };

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      rk: getDefaultRk(call?.rk),
      city: call?.city && CITY_OPTIONS.includes(call.city as typeof CITY_OPTIONS[number]) 
        ? call.city as typeof CITY_OPTIONS[number] 
        : undefined,
      avitoName: getDefaultSource(call?.avitoName),
      typeOrder: 'Впервые',
      typeEquipment: 'Не указано',
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

  // Загрузка истории заказов по номеру телефона
  useEffect(() => {
    const loadOrderHistory = async () => {
      if (!call?.phoneClient || !open) return;
      
      try {
        setOrderHistoryLoading(true);
        const response = await authApi.get(`/orders/by-phone/${encodeURIComponent(call.phoneClient)}`);
        if (response.data.success) {
          setOrderHistory(response.data.data || []);
        }
      } catch (error) {
        console.error('Error loading order history:', error);
        setOrderHistory([]);
      } finally {
        setOrderHistoryLoading(false);
      }
    };

    loadOrderHistory();
  }, [call?.phoneClient, open]);

  // Загрузка истории звонков по номеру телефона (все операторы)
  useEffect(() => {
    const loadCallHistory = async () => {
      if (!call?.phoneClient || !open) return;
      
      try {
        setCallHistoryLoading(true);
        const response = await authApi.get(`/calls/by-phone/${encodeURIComponent(call.phoneClient)}`);
        if (response.data.success) {
          setCallHistory(response.data.data || []);
        }
      } catch (error) {
        console.error('Error loading call history:', error);
        // Fallback на callGroup если API не работает
        setCallHistory(callGroup.length > 0 ? callGroup : (call ? [call] : []));
      } finally {
        setCallHistoryLoading(false);
      }
    };

    loadCallHistory();
  }, [call?.phoneClient, open, call, callGroup]);

  // Воспроизведение записи звонка
  const handlePlayRecording = async (callItem: Call) => {
    if (!callItem.recordingPath) return;
    
    if (playingCallId === callItem.id) {
      setPlayingCallId(null);
      return;
    }
    
    try {
      setPlayingCallId(callItem.id);
      const response = await authApi.get(`/recordings/${callItem.id}/url`);
      if (response.data.success && response.data.data?.url) {
        const audio = new Audio(response.data.data.url);
        audio.play();
        audio.onended = () => setPlayingCallId(null);
      }
    } catch (error) {
      console.error('Error playing recording:', error);
      setPlayingCallId(null);
    }
  };

  // Форматирование номера телефона
  const formatPhoneDisplay = (phoneClient: string) => {
    if (!phoneClient) return 'Неизвестно';
    
    // SIP-адрес
    if (phoneClient.toLowerCase().includes('sip:')) {
      const match = phoneClient.match(/sip:([^@]+)@/i);
      if (match) {
        return match[1].split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
      return phoneClient;
    }
    
    // Обычный номер
    const digits = phoneClient.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('7')) {
      return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
    }
    return phoneClient;
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!call) return;

    try {
      setIsSubmitting(true);

      const orderData = {
        callIds: callGroup.length > 0 ? callGroup.map(c => c.id) : [call.id],
        rk: data.rk === 'Не указано' ? '' : data.rk,
        avitoName: data.avitoName === 'Не указано' ? '' : data.avitoName,
        city: data.city,
        typeOrder: data.typeOrder,
        clientName: data.clientName,
        address: data.address,
        dateMeeting: data.dateMeeting,
        typeEquipment: data.typeEquipment === 'Не указано' ? '' : data.typeEquipment,
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
    setOrderHistory([]);
    onOpenChange(false);
  };

  // Автозаполнение формы при изменении звонка или загрузке списков
  useEffect(() => {
    if (call && open) {
      setTimeout(() => {
        // РК: если есть в списке campaigns - берём, иначе "Не указано"
        const rkValue = call.rk && campaigns.includes(call.rk) ? call.rk : 'Не указано';
        setValue('rk', rkValue);
        
        // Город
        setValue('city', call.city && CITY_OPTIONS.includes(call.city as typeof CITY_OPTIONS[number]) 
          ? call.city as typeof CITY_OPTIONS[number] 
          : '' as any);
        
        // Источник: если есть в списке sources - берём, иначе "Не указано"
        const sourceValue = call.avitoName && sources.includes(call.avitoName) ? call.avitoName : 'Не указано';
        setValue('avitoName', sourceValue);
        
        setValue('typeOrder', 'Впервые');
        setValue('typeEquipment', 'Не указано');
        setValue('clientName', '');
        setValue('address', '');
        setValue('dateMeeting', '');
        setValue('problem', '');
      }, 0);
    }
  }, [call?.id, open, setValue, campaigns, sources]);

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Используем callGroup если есть, иначе только текущий звонок
  const callsToShow = callGroup.length > 0 ? callGroup : [call];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#17212b] border border-[#FFD700]/40 shadow-[0_0_40px_rgba(255,215,0,0.15)] w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f23] border-b border-[#FFD700]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Новый заказ</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="h-3 w-3" />
                <span className="font-medium text-white">{call.phoneClient}</span>
                {call.city && (
                  <>
                    <span className="text-gray-600">•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{call.city}</span>
                  </>
                )}
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

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: History panels */}
          <div className="w-[420px] border-r border-[#FFD700]/10 flex flex-col overflow-hidden bg-[#0f0f23]/30">
            {/* История звонков (все операторы) */}
            <div className="border-b border-[#FFD700]/10 flex-1 flex flex-col overflow-hidden">
              <button 
                onClick={() => setShowCallHistory(!showCallHistory)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>История звонков ({callHistoryLoading ? '...' : callHistory.length})</span>
                </div>
                {showCallHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showCallHistory && (
                <ScrollArea className="flex-1">
                  <div className="px-2 pb-2 space-y-1.5">
                    {callHistoryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    ) : callHistory.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-4">
                        Звонков не найдено
                      </div>
                    ) : (
                      callHistory.map((c) => {
                        const isOutgoing = c.callDirection === 'outgoing' || c.phoneClient?.toLowerCase().includes('sip:');
                        const isCurrentCall = c.id === call?.id;
                        
                        return (
                          <div 
                            key={c.id} 
                            className={`p-2.5 rounded-lg text-xs ${isCurrentCall ? 'bg-[#FFD700]/10 border border-[#FFD700]/30' : 'bg-[#17212b]/50 hover:bg-[#17212b]'} transition-colors`}
                          >
                            {/* Строка 1: Дата/время + Направление + Статус */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300 font-medium">{formatDate(c.dateCreate)}</span>
                                {/* Направление */}
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                                  isOutgoing 
                                    ? 'bg-blue-500/10 text-blue-400' 
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                  {isOutgoing ? <PhoneOutgoing className="h-2.5 w-2.5" /> : <PhoneIncoming className="h-2.5 w-2.5" />}
                                  {isOutgoing ? 'Исход.' : 'Вход.'}
                                </span>
                              </div>
                              {/* Статус */}
                              <span className={`flex items-center gap-1 ${
                                c.status === 'answered' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {c.status === 'answered' ? (
                                  <PhoneCall className="h-3 w-3" />
                                ) : (
                                  <PhoneMissed className="h-3 w-3" />
                                )}
                                {formatDuration(c.duration)}
                              </span>
                            </div>
                            
                            {/* Строка 2: Оператор + РК + Город */}
                            <div className="flex items-center gap-2 mb-1.5 text-gray-400">
                              <div className="flex items-center gap-1 min-w-0 flex-1">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{c.operator?.name || 'Без оператора'}</span>
                              </div>
                              <span className="text-gray-600">•</span>
                              <span className="text-[#FFD700] shrink-0">{c.rk || '—'}</span>
                              <span className="text-gray-600">•</span>
                              <span className="shrink-0">{c.city || '—'}</span>
                            </div>
                            
                            {/* Строка 3: Номер клиента + Запись */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-gray-500">
                                <Phone className="h-3 w-3" />
                                <span className="font-mono text-[11px]">{formatPhoneDisplay(c.phoneClient)}</span>
                              </div>
                              {/* Кнопка воспроизведения */}
                              {c.recordingPath && (
                                <button
                                  onClick={() => handlePlayRecording(c)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                                    playingCallId === c.id 
                                      ? 'bg-[#FFD700]/20 text-[#FFD700]' 
                                      : 'bg-gray-700/50 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10'
                                  }`}
                                >
                                  <Play className="h-3 w-3" />
                                  {playingCallId === c.id ? 'Играет...' : 'Запись'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* История заказов */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <button 
                onClick={() => setShowOrderHistory(!showOrderHistory)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>История заказов ({orderHistory.length})</span>
                </div>
                {showOrderHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showOrderHistory && (
                <ScrollArea className="flex-1">
                  <div className="px-2 pb-2 space-y-1">
                    {orderHistoryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    ) : orderHistory.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-4">
                        Заказов не найдено
                      </div>
                    ) : (
                      orderHistory.map((order) => (
                        <div key={order.id} className="p-2 rounded-lg bg-[#17212b]/50 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 font-medium">#{order.id}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-gray-400 truncate">{order.clientName}</div>
                          <div className="flex items-center gap-2 mt-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <form key={call?.id} onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
                {/* Row 1: РК + Город */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">РК</Label>
                    <Controller
                      name="rk"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-sm [&>span]:text-gray-500 data-[state=open]:[&>span]:text-white [&[data-state=closed]]:text-white">
                            <SelectValue placeholder="Не указано" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                            <SelectItem value="Не указано" className="text-gray-400">Не указано</SelectItem>
                            {campaigns.map((option) => (
                              <SelectItem key={option} value={option} className="text-white">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Город *</Label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm [&>span]:text-gray-400 [&>span]:data-[state=open]:text-white">
                            <SelectValue placeholder="Выберите город" />
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

                {/* Row 2: Источник + Направление */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Источник</Label>
                    <Controller
                      name="avitoName"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-sm [&>span]:text-gray-500 data-[state=open]:[&>span]:text-white [&[data-state=closed]]:text-white">
                            <SelectValue placeholder="Не указано" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#17212b] border-[#FFD700]/30 max-h-60">
                            <SelectItem value="Не указано" className="text-gray-400">Не указано</SelectItem>
                            {sources.map((option) => (
                              <SelectItem key={option} value={option} className="text-white">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Направление</Label>
                    <Controller
                      name="typeEquipment"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-sm [&>span]:text-gray-500 data-[state=open]:[&>span]:text-white [&[data-state=closed]]:text-white">
                            <SelectValue placeholder="Не указано" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                            {DIRECTION_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className={option === 'Не указано' ? 'text-gray-400' : 'text-white'}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#FFD700]/10" />

                {/* Row 3: Клиент + Адрес */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Имя клиента *</Label>
                    <Input
                      {...register('clientName')}
                      placeholder="Введите имя"
                      className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500"
                    />
                    {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Адрес *</Label>
                    <Input
                      {...register('address')}
                      placeholder="Введите адрес"
                      className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500"
                    />
                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
                  </div>
                </div>

                {/* Row 4: Тип заказа + Дата встречи */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Тип заказа *</Label>
                    <Controller
                      name="typeOrder"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm">
                            <SelectValue placeholder="Выберите тип" />
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
                    <Label className="text-xs text-gray-400 mb-1 block">Дата встречи *</Label>
                    <Input
                      type="datetime-local"
                      {...register('dateMeeting')}
                      className="h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm [&::-webkit-calendar-picker-indicator]:invert"
                    />
                    {errors.dateMeeting && <p className="text-xs text-red-400 mt-1">{errors.dateMeeting.message}</p>}
                  </div>
                </div>

                {/* Row 5: Проблема */}
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Проблема *</Label>
                  <Textarea
                    {...register('problem')}
                    placeholder="Опишите проблему клиента..."
                    rows={3}
                    className="bg-[#0f0f23] border-[#FFD700]/20 text-white text-sm placeholder:text-gray-500 resize-none"
                  />
                  {errors.problem && <p className="text-xs text-red-400 mt-1">{errors.problem.message}</p>}
                </div>
              </form>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#0f0f23] border-t border-[#FFD700]/20 flex justify-end gap-2 shrink-0">
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
      </div>
    </div>
  );
}
