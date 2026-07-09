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
  Pause,
  User,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';

// Статические опции
const CITY_OPTIONS = ['Саратов', 'Энгельс', 'Ульяновск', 'Пенза', 'Тольятти', 'Омск', 'Ярославль', 'Липецк'] as const;
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
  createdAt: string;
  duration?: number;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  callDirection: 'inbound' | 'outbound' | 'callback';
  masterId?: number | null;
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
  statusOrder: string;
  dateMeeting: string;
  typeEquipment: string;
  typeOrder?: string;
  problem?: string;
  createdAt: string;
  rk?: string;
  avitoName?: string;
  address?: string;
  result?: number;
  master?: {
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
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [sources, setSources] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
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

  // Воспроизведение записи звонка - открывает плеер снизу
  const handlePlayRecording = async (callItem: Call) => {
    if (!callItem.recordingPath) return;
    
    // Если тот же звонок - закрываем плеер
    if (playingCallId === callItem.id) {
      handleClosePlayer();
      return;
    }
    
    try {
      setAudioLoading(true);
      setPlayingCallId(callItem.id);
      setPlayingCall(callItem);
      
      // Получаем JSON с URL записи
      const response = await authApi.get(`/recordings/call/${callItem.id}/download`);
      
      if (response.data.success && response.data.url) {
        setAudioUrl(response.data.url);
      } else {
        throw new Error(response.data.message || 'Не удалось получить URL записи');
      }
    } catch (error) {
      console.error('Error loading recording:', error);
      handleClosePlayer();
    } finally {
      setAudioLoading(false);
    }
  };

  // Закрытие плеера
  const handleClosePlayer = () => {
    // Останавливаем воспроизведение
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingCallId(null);
    setPlayingCall(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  // Play/Pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // Перемотка
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Форматирование времени для плеера
  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 lg:p-4">
      <div className={`w-full h-full lg:h-auto lg:max-w-5xl lg:max-h-[90vh] lg:rounded-xl overflow-hidden flex flex-col bg-[#F3F3EE] dark:bg-[#1e2530] lg:border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-none`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-3 sm:px-5 py-3 border-b shrink-0 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h2 className={`text-base sm:text-lg font-semibold shrink-0 text-gray-900 dark:text-gray-100`}>Новый заказ</h2>
            <div className={`hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400`}>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className={`font-medium text-gray-700 dark:text-gray-200`}>{call.phoneClient}</span>
              {call.city && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{call.city}</span>
                </>
              )}
            </div>
            {/* Mobile phone display */}
            <span className={`sm:hidden text-xs font-medium truncate text-gray-600 dark:text-gray-300`}>{call.phoneClient}</span>
          </div>
          <button
            onClick={handleClose}
            className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Content - flex-col on mobile, flex-row on desktop */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:max-h-[700px]">
          {/* History panels - order-2 on mobile (bottom), order-1 on desktop (left) */}
          <div className={`order-2 lg:order-1 lg:w-[420px] border-t lg:border-t-0 lg:border-r flex flex-col overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2530]`}>
            {/* История звонков (все операторы) */}
            <div className={`border-b flex flex-col overflow-hidden lg:max-h-[50%] border-gray-200 dark:border-gray-700`}>
              <button 
                onClick={() => setShowCallHistory(!showCallHistory)}
                className={`w-full px-3 py-2.5 sm:py-2 flex items-center justify-between text-xs sm:text-sm lg:text-xs font-medium transition-colors shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100`}
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  <span>История звонков ({callHistoryLoading ? '...' : callHistory.length})</span>
                </div>
                {showCallHistory ? <ChevronUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <ChevronDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
              </button>
              {showCallHistory && (
                <ScrollArea className="flex-1 max-h-[200px] lg:max-h-[280px]">
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
                        const isOutgoing = c.callDirection === 'outbound' || c.callDirection === 'callback';
                        const isCallback = c.callDirection === 'callback';
                        const isCurrentCall = c.id === call?.id;
                        
                        return (
                          <div 
                            key={c.id} 
                            className={`p-2.5 rounded-lg text-xs transition-colors ${
                              isCurrentCall 
                                ? 'bg-[#FEC004]/10 border border-[#FEC004]/30' 
                                : 'bg-gray-50 dark:bg-[#252d3a] hover:bg-gray-100 dark:hover:bg-[#2d3748]'
                            }`}
                          >
                            {/* Строка 1: Дата/время + Направление + Статус */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-gray-700 dark:text-gray-300`}>{formatDate(c.createdAt)}</span>
                                {/* Направление */}
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
                                  {isOutgoing ? <PhoneOutgoing className="h-2.5 w-2.5" /> : <PhoneIncoming className="h-2.5 w-2.5" />}
                                  {isCallback ? 'От мастера' : isOutgoing ? 'Исход.' : 'Вход.'}
                                </span>
                              </div>
                              {/* Статус */}
                              <span className={`flex items-center gap-1 ${
                                c.status === 'answered' 
                                  ? 'text-gray-600' 
                                  : 'text-red-500'
                              }`}>
                                {c.status === 'answered' ? (
                                  <PhoneCall className="h-3 w-3" />
                                ) : (
                                  <PhoneMissed className="h-3 w-3" />
                                )}
                                {formatDuration(c.duration)}
                              </span>
                            </div>
                            
                            {/* Строка 2: Оператор + РК + Источник + Город */}
                            <div className={`flex items-center gap-2 mb-1.5 text-[11px] text-gray-500 dark:text-gray-400`}>
                              <div className="flex items-center gap-1 min-w-0">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{c.operator?.name || 'Без оператора'}</span>
                              </div>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className={`shrink-0 text-gray-700 dark:text-gray-300 font-medium`}>{c.rk || '—'}</span>
                              {c.avitoName && (
                                <>
                                  <span className="text-gray-300 dark:text-gray-600">•</span>
                                  <span className={`shrink-0 text-gray-600 dark:text-gray-400`}>{c.avitoName}</span>
                                </>
                              )}
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="shrink-0">{c.city || '—'}</span>
                            </div>
                            
                            {/* Строка 3: Номер клиента + Запись */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-1 text-gray-500`}>
                                <Phone className="h-3 w-3" />
                                <span className="font-mono text-[11px]">{formatPhoneDisplay(c.phoneClient)}</span>
                              </div>
                              {/* Кнопка воспроизведения */}
                              {c.recordingPath && (
                                <button
                                  onClick={() => handlePlayRecording(c)}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                                    playingCallId === c.id 
                                      ? 'bg-[#FEC004]/20 text-[#FEC004]' 
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10'
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
                className={`w-full px-3 py-2.5 sm:py-2 flex items-center justify-between text-xs sm:text-sm lg:text-xs font-medium transition-colors shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  <span>История заказов ({orderHistory.length})</span>
                </div>
                {showOrderHistory ? <ChevronUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <ChevronDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
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
                        <div key={order.id} className={`p-2.5 rounded-lg text-xs space-y-1.5 bg-gray-50 dark:bg-[#252d3a]`}>
                          {/* Строка 1: ID + Тип заказа + Статус */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-gray-900 dark:text-gray-100`}>#{order.id}</span>
                              {order.typeOrder && (
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600`}>
                                  {order.typeOrder}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600`}>
                              {(order as any).status || order.statusOrder || 'Нет статуса'}
                            </Badge>
                          </div>
                          
                          {/* Строка 2: РК + Источник */}
                          <div className={`flex items-center gap-2 text-gray-500 dark:text-gray-400`}>
                            {order.rk && (
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{order.rk}</span>
                            )}
                            {order.rk && order.avitoName && <span className="text-gray-300 dark:text-gray-600">•</span>}
                            {order.avitoName && (
                              <span className="text-gray-600 dark:text-gray-400">{order.avitoName}</span>
                            )}
                          </div>
                          
                          {/* Строка 3: Имя клиента */}
                          <div className="flex items-center gap-1.5">
                            <User className={`h-3 w-3 text-gray-400`} />
                            <span className={`truncate text-gray-700 dark:text-gray-300`}>{order.clientName}</span>
                          </div>
                          
                          {/* Строка 4: Адрес */}
                          {order.address && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className={`h-3 w-3 text-gray-400`} />
                              <span className={`truncate text-gray-500 dark:text-gray-400`}>{order.address}</span>
                            </div>
                          )}
                          
                          {/* Строка 5: Мастер + Итог */}
                          <div className={`flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-600`}>
                            <div className={`flex items-center gap-1.5 text-gray-500 dark:text-gray-400`}>
                              <span>Мастер:</span>
                              <span className="text-gray-700 dark:text-gray-300">{order.master?.name || '—'}</span>
                            </div>
                            {order.result !== undefined && order.result !== null && (
                              <span className={`font-medium text-gray-900 dark:text-gray-100`}>{order.result.toLocaleString('ru-RU')} ₽</span>
                            )}
                          </div>
                          
                          {/* Кнопка перехода к заказу */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/orders?orderId=${order.id}`, '_blank')}
                            className={`w-full mt-2 h-6 text-[10px] text-[#FEC004] border-[#FEC004]/30 hover:bg-[#FEC004]/10 hover:border-[#FEC004]`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Открыть заказ
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Form - order-1 on mobile (top), order-2 on desktop (right) */}
          <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <form key={call?.id} onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 space-y-3">
                {/* Row 1: РК + Город */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>РК</Label>
                    <Controller
                      name="rk"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Не указано</span>} />
                          </SelectTrigger>
                          <SelectContent className={`z-[10000] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600`}>
                            <SelectItem value="Не указано" className="text-gray-500 dark:text-gray-400 data-[highlighted]:bg-[#FEC004]/10">Не указано</SelectItem>
                            {campaigns.map((option) => (
                              <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Город *</Label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Выберите город</span>} />
                          </SelectTrigger>
                          <SelectContent className={`z-[10000] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600`}>
                            {CITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
                  </div>
                </div>

                {/* Row 2: Источник + Направление */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Источник</Label>
                    <Controller
                      name="avitoName"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Не указано</span>} />
                          </SelectTrigger>
                          <SelectContent className={`z-[10000] max-h-60 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600`}>
                            <SelectItem value="Не указано" className="text-gray-500 dark:text-gray-400 data-[highlighted]:bg-[#FEC004]/10">Не указано</SelectItem>
                            {sources.map((option) => (
                              <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Направление</Label>
                    <Controller
                      name="typeEquipment"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}>
                            <SelectValue placeholder={<span className="text-gray-500 dark:text-gray-400">Не указано</span>} />
                          </SelectTrigger>
                          <SelectContent className={`z-[10000] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600`}>
                            {DIRECTION_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className={`border-t border-gray-200 dark:border-gray-700`} />

                {/* Row 3: Клиент + Адрес */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Имя клиента *</Label>
                    <Input
                      {...register('clientName')}
                      placeholder="Введите имя"
                      className={`h-9 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/30`}
                    />
                    {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>}
                  </div>
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Адрес *</Label>
                    <Input
                      {...register('address')}
                      placeholder="Введите адрес"
                      className={`h-9 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/30`}
                    />
                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
                  </div>
                </div>

                {/* Row 4: Тип заказа + Дата встречи */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Тип заказа *</Label>
                    <Controller
                      name="typeOrder"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent className={`z-[10000] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600`}>
                            <SelectItem value="Впервые" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Впервые</SelectItem>
                            <SelectItem value="Повтор" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Повтор</SelectItem>
                            <SelectItem value="Гарантия" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Гарантия</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.typeOrder && <p className="text-xs text-red-400 mt-1">{errors.typeOrder.message}</p>}
                  </div>
                  <div>
                    <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Дата встречи *</Label>
                    <Input
                      type="datetime-local"
                      {...register('dateMeeting')}
                      className={`h-9 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/30 dark:[color-scheme:dark]`}
                    />
                    {errors.dateMeeting && <p className="text-xs text-red-400 mt-1">{errors.dateMeeting.message}</p>}
                  </div>
                </div>

                {/* Row 5: Проблема */}
                <div>
                  <Label className={`text-xs mb-1 block text-gray-600 dark:text-gray-400`}>Проблема *</Label>
                  <Textarea
                    {...register('problem')}
                    placeholder="Опишите проблему клиента..."
                    rows={3}
                    className={`text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/30`}
                  />
                  {errors.problem && <p className="text-xs text-red-400 mt-1">{errors.problem.message}</p>}
                </div>
              </form>
            </ScrollArea>

            {/* Footer */}
            <div className={`px-3 sm:px-4 py-3 border-t flex justify-end gap-2 shrink-0 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-700`}>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`h-9 px-3 sm:px-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
                className={`h-9 px-4 sm:px-5 font-medium text-sm bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Создание...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Создать заказ</span>
                    <span className="sm:hidden">Создать</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Player - показывается снизу при воспроизведении */}
        {playingCall && (
          <div className={`border-t-2 px-3 sm:px-4 py-2 sm:py-3 shrink-0 border-[#FEC004]/40 bg-white dark:bg-[#252d3a]`}>
            {/* Скрытый audio элемент */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={handleClosePlayer}
              />
            )}
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Кнопка Play/Pause */}
              <button
                onClick={togglePlayPause}
                disabled={audioLoading || !audioUrl}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 bg-[#FEC004] hover:bg-[#e6ac00]`}
              >
                {audioLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-900" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 ml-0.5" />
                )}
              </button>

              {/* Информация о звонке - скрыта на мобильных */}
              <div className="hidden sm:block min-w-0 w-48">
                <div className={`text-sm font-medium truncate text-gray-900 dark:text-gray-100`}>
                  {playingCall.operator?.name || 'Оператор'}
                </div>
                <div className={`text-xs flex items-center gap-1.5 truncate text-gray-500 dark:text-gray-400`}>
                  <span>{formatDate(playingCall.createdAt)}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className={
                    playingCall.callDirection === 'callback' 
                      ? 'text-purple-400' 
                      : playingCall.callDirection === 'outbound' 
                        ? 'text-blue-400' 
                        : 'text-emerald-400'
                  }>
                    {playingCall.callDirection === 'callback' ? 'От мастера' : playingCall.callDirection === 'outbound' ? 'Исход.' : 'Вход.'}
                  </span>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3">
                <span className={`text-[10px] sm:text-xs w-8 sm:w-10 text-right font-mono text-gray-500 dark:text-gray-400`}>
                  {formatAudioTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className={`w-full h-1.5 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-3
                      [&::-moz-range-thumb]:h-3
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer
                      bg-gray-200 dark:bg-gray-700 [&::-webkit-slider-thumb]:bg-[#FEC004] [&::-moz-range-thumb]:bg-[#FEC004]`}
                    style={{
                      background: `linear-gradient(to right, #FEC004 0%, #FEC004 ${(currentTime / (duration || 1)) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} ${(currentTime / (duration || 1)) * 100}%, ${isDark ? '#374151' : '#e5e7eb'} 100%)`
                    }}
                  />
                </div>
                <span className={`text-[10px] sm:text-xs w-8 sm:w-10 font-mono text-gray-500 dark:text-gray-400`}>
                  {formatAudioTime(duration)}
                </span>
              </div>

              {/* Кнопка закрытия */}
              <button
                onClick={handleClosePlayer}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
