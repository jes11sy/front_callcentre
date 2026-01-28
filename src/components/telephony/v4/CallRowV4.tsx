'use client';

import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown,
  ChevronUp,
  Plus,
  Play,
  Download,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import { Call } from '@/types/telephony';
import { cn } from '@/lib/utils';

// Склонение слов
function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/**
 * Форматирует номер телефона для красивого отображения
 * +79001234567 → "+7 900 123-45-67"
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return 'Неизвестно';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  }
  
  return phone;
}

/**
 * Проверяет, является ли phoneClient SIP-адресом (исходящий звонок)
 */
function isSipCall(phoneClient: string): boolean {
  return phoneClient?.toLowerCase().includes('sip:') || false;
}

interface CallRowV4Props {
  call: Call;
  phoneClient: string;
  groupCalls: Call[];
  hasMultipleCalls: boolean;
  isExpanded: boolean;
  isMainRow: boolean;
  onToggleGroup: (phoneClient: string) => void;
  onCreateOrder: (call: Call, group: Call[]) => void;
  onLoadOrderHistory: (call: Call) => void;
  onPlayRecording: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  isPlaying: boolean;
  orderHistoryLoading: boolean;
}

export const CallRowV4: React.FC<CallRowV4Props> = React.memo(({
  call,
  phoneClient,
  groupCalls,
  hasMultipleCalls,
  isExpanded,
  isMainRow,
  onToggleGroup,
  onCreateOrder,
  onLoadOrderHistory: _onLoadOrderHistory,
  onPlayRecording,
  onDownloadRecording,
  isPlaying,
  orderHistoryLoading: _orderHistoryLoading
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    }
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      answered: { 
        icon: PhoneIncoming, 
        label: 'Отвечен', 
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        rowBg: ''
      },
      missed: { 
        icon: PhoneMissed, 
        label: 'Пропущен', 
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        rowBg: 'bg-red-950/30'
      },
      busy: { 
        icon: Phone, 
        label: 'Занято', 
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        rowBg: ''
      },
      no_answer: { 
        icon: Phone, 
        label: 'Нет ответа', 
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        rowBg: 'bg-orange-950/20'
      }
    };
    return configs[status as keyof typeof configs] || configs.no_answer;
  };

  // Конфигурация направления звонка
  const getDirectionConfig = (direction?: 'incoming' | 'outgoing') => {
    if (direction === 'outgoing') {
      return {
        icon: PhoneOutgoing,
        label: 'Исходящий',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
      };
    }
    return {
      icon: PhoneIncoming,
      label: 'Входящий',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    };
  };

  const statusConfig = getStatusConfig(call.status);
  const StatusIcon = statusConfig.icon;
  const duration = formatDuration(call.duration);
  const directionConfig = getDirectionConfig(call.callDirection);
  const DirectionIcon = directionConfig.icon;
  const isOutgoing = isSipCall(call.phoneClient);
  
  // Для исходящих звонков показываем phoneAts (номер клиента), для входящих — phoneClient
  const displayPhone = isOutgoing 
    ? formatPhoneNumber(call.phoneAts) 
    : formatPhoneNumber(call.phoneClient);

  return (
    <TableRow 
      className={cn(
        "border-b border-[#FFD700]/10",
        isMainRow ? "hover:bg-[#1a1a2e]" : "hover:bg-[#1a1a2e]/50 bg-[#0f0f23]/50",
        statusConfig.rowBg
      )}
    >
      {/* Колонка 1: Клиент */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-3">
          {isMainRow ? (
            <>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isOutgoing ? directionConfig.bgColor : statusConfig.bgColor
              )}>
                {isOutgoing ? (
                  <DirectionIcon className={cn("w-4 h-4", directionConfig.color)} />
                ) : (
                  <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                )}
              </div>
              <div>
                {isOutgoing ? (
                  // Исходящий звонок - показываем номер клиента (куда звонили)
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-400 font-mono">
                      {displayPhone}
                    </span>
                    <span className="text-xs text-gray-500">
                      Исходящий звонок
                    </span>
                  </div>
                ) : (
                  // Входящий звонок - показываем номер телефона клиента
                  <div className="font-semibold text-[#FFD700] font-mono">
                    {displayPhone}
                  </div>
                )}
                {hasMultipleCalls && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleGroup(phoneClient);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FFD700] transition-colors mt-0.5"
                  >
                    <span>+{groupCalls.length - 1} {pluralize(groupCalls.length - 1, 'звонок', 'звонка', 'звонков')}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 pl-8">
              <div className="w-0.5 h-5 bg-[#FFD700]/30 rounded" />
              {isOutgoing ? (
                <DirectionIcon className={cn("w-3.5 h-3.5", directionConfig.color)} />
              ) : (
                <StatusIcon className={cn("w-3.5 h-3.5", statusConfig.color)} />
              )}
              <span className={cn(
                "text-sm font-mono",
                isOutgoing ? "text-blue-400" : "text-gray-400"
              )}>
                {displayPhone}
              </span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Колонка 2: Источник */}
      <TableCell className="py-3 px-4">
        {isOutgoing ? (
          // Для исходящих звонков показываем "Не указано"
          <span className="text-sm text-gray-500">Не указано</span>
        ) : (
          // Для входящих звонков показываем город, РК и источник
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-white">{call.city}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{call.rk}</span>
            </div>
            {call.avitoName && (
              <Badge 
                variant="outline" 
                className="text-xs border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/5"
              >
                {call.avitoName}
              </Badge>
            )}
          </div>
        )}
      </TableCell>

      {/* Колонка 3: Дата и время */}
      <TableCell className="py-3 px-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-gray-400">{formatDate(call.dateCreate)}</span>
            <span className="font-medium text-white">{formatTime(call.dateCreate)}</span>
          </div>
          {duration && (
            <div className="text-xs text-gray-500 font-mono pl-5">
              Длительность: {duration}
            </div>
          )}
        </div>
      </TableCell>

      {/* Колонка 4: Оператор */}
      <TableCell className="py-3 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-white">{call.operator.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Направление звонка */}
            <Badge 
              variant="outline" 
              className={cn("text-xs flex items-center gap-1", directionConfig.borderColor, directionConfig.color)}
            >
              <DirectionIcon className="w-3 h-3" />
              {directionConfig.label}
            </Badge>
            {/* Статус звонка */}
            <Badge 
              variant="outline" 
              className={cn("text-xs", statusConfig.borderColor, statusConfig.color)}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </TableCell>

      {/* Колонка 5: Действия */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center justify-end gap-1">
          {isMainRow ? (
            <>
              {call.recordingPath && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayRecording(call)}
                    className={cn(
                      "h-8 w-8 p-0",
                      isPlaying 
                        ? "text-[#FFD700] bg-[#FFD700]/20" 
                        : "text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                    )}
                    title="Прослушать"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadRecording(call)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                    title="Скачать"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                onClick={() => onCreateOrder(call, groupCalls)}
                className="h-8 bg-[#FFD700] hover:bg-[#FFC700] text-[#0f0f23] font-medium px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Новый заказ
              </Button>
            </>
          ) : (
            call.recordingPath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayRecording(call)}
                className="h-7 w-7 p-0 text-gray-500 hover:text-[#FFD700]"
              >
                <Play className="w-3.5 h-3.5" />
              </Button>
            )
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.call.id === nextProps.call.id &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.orderHistoryLoading === nextProps.orderHistoryLoading &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isMainRow === nextProps.isMainRow
  );
});

CallRowV4.displayName = 'CallRowV4';
