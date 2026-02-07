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
import { useDesignStore } from '@/store/designStore';

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
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
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
  const getDirectionConfig = (direction: 'inbound' | 'outbound' | 'callback') => {
    if (direction === 'outbound') {
      return {
        icon: PhoneOutgoing,
        label: 'Исходящий',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
      };
    }
    if (direction === 'callback') {
      return {
        icon: PhoneOutgoing,
        label: 'От мастера',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
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
  const isCallback = call.callDirection === 'callback';
  
  // Для исходящих/callback звонков показываем phoneAts (номер клиента), для входящих — phoneClient
  const displayPhone = (isOutgoing || isCallback)
    ? formatPhoneNumber(call.phoneAts) 
    : formatPhoneNumber(call.phoneClient);

  return (
    <TableRow 
      className={cn(
        "border-b",
        isV2 ? (
          cn(
            "border-gray-100 dark:border-gray-700 font-myriad",
            isMainRow ? "hover:bg-gray-50 dark:hover:bg-[#252d3a]" : "hover:bg-gray-50/50 dark:hover:bg-[#252d3a]/50 bg-gray-50/30 dark:bg-[#1e2530]/30",
            call.status === 'missed' && "bg-red-50/50 dark:bg-red-900/20"
          )
        ) : (
          cn(
            "border-[#FFD700]/10",
            isMainRow ? "hover:bg-[#1a1a2e]" : "hover:bg-[#1a1a2e]/50 bg-[#0f0f23]/50",
            statusConfig.rowBg
          )
        )
      )}
    >
      {/* Колонка 1: Клиент */}
      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {isMainRow ? (
            <>
              {/* Иконка статуса/направления - только для V1 */}
              {!isV2 && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isCallback ? directionConfig.bgColor : isOutgoing ? directionConfig.bgColor : statusConfig.bgColor
                )}>
                  {isCallback ? (
                    <DirectionIcon className={cn("w-4 h-4", directionConfig.color)} />
                  ) : isOutgoing ? (
                    <DirectionIcon className={cn("w-4 h-4", directionConfig.color)} />
                  ) : (
                    <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                  )}
                </div>
              )}
              <div className="min-w-0">
                {isCallback ? (
                  // Callback - звонок от мастера клиенту
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-semibold font-mono text-xs sm:text-sm truncate",
                      isV2 ? "text-gray-900 dark:text-gray-100" : "text-purple-400"
                    )}>
                      {displayPhone}
                    </span>
                    <span className={cn(
                      "text-[10px] sm:text-xs truncate",
                      isV2 ? "text-gray-500 dark:text-gray-400" : "text-purple-400/70"
                    )}>
                      {call.masterName 
                        ? `От мастера: ${call.masterName}` 
                        : call.masterId 
                          ? `От мастера (ID: ${call.masterId})` 
                          : 'Звонок от мастера'}
                    </span>
                  </div>
                ) : isOutgoing ? (
                  // Исходящий звонок - показываем номер клиента (куда звонили)
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-400 font-mono text-xs sm:text-sm truncate">
                      {displayPhone}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Исходящий
                    </span>
                  </div>
                ) : (
                  // Входящий звонок - показываем номер телефона клиента
                  <div className={cn(
                    "font-semibold font-mono text-xs sm:text-sm truncate",
                    isV2 ? "text-gray-900 dark:text-gray-100" : "text-[#FFD700]"
                  )}>
                    {displayPhone}
                  </div>
                )}
                {/* Статус - показываем на мобильных */}
                {isV2 && (
                  <div className="flex items-center gap-1 mt-0.5 lg:hidden">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      call.status === 'missed' 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}>
                      {statusConfig.label}
                    </span>
                  </div>
                )}
                {hasMultipleCalls && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleGroup(phoneClient);
                    }}
                    className={cn(
                      "flex items-center gap-1 text-[10px] sm:text-xs transition-colors mt-0.5",
                      isV2 
                        ? "text-gray-500 dark:text-gray-400 hover:text-[#FEC004]"
                        : "text-gray-400 hover:text-[#FFD700]"
                    )}
                  >
                    <span>+{groupCalls.length - 1} <span className="hidden sm:inline">{pluralize(groupCalls.length - 1, 'звонок', 'звонка', 'звонков')}</span></span>
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
            <div className={cn("flex items-center gap-2", isV2 ? "pl-2 sm:pl-4" : "pl-8")}>
              <div className={cn(
                "w-0.5 h-5 rounded",
                isV2 ? "bg-[#FEC004]/40" : "bg-[#FFD700]/30"
              )} />
              {/* Иконка статуса/направления - только для V1 */}
              {!isV2 && (
                isCallback || isOutgoing ? (
                  <DirectionIcon className={cn("w-3.5 h-3.5", directionConfig.color)} />
                ) : (
                  <StatusIcon className={cn("w-3.5 h-3.5", statusConfig.color)} />
                )
              )}
              <span className={cn(
                "text-xs sm:text-sm font-mono truncate",
                isCallback 
                  ? isV2 ? "text-gray-700 dark:text-gray-300" : "text-purple-400"
                  : isOutgoing 
                    ? "text-blue-400" 
                    : isV2 
                      ? "text-gray-700 dark:text-gray-300" 
                      : "text-gray-400"
              )}>
                {displayPhone}
                {isCallback && (
                  <span className={cn("text-[10px] sm:text-xs ml-1 hidden sm:inline", isV2 ? "text-gray-500 dark:text-gray-400" : "text-purple-400/60")}>
                    {call.masterName ? `(мастер: ${call.masterName})` : '(от мастера)'}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </TableCell>

      {/* Колонка 2: Источник - скрыта на мобильных */}
      <TableCell className="hidden lg:table-cell py-3 px-4">
        {isOutgoing ? (
          // Для исходящих звонков показываем "Не указано"
          <span className="text-sm text-gray-500 dark:text-gray-400">Не указано</span>
        ) : (
          // Для входящих звонков показываем город, РК и источник
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className={isV2 ? "text-gray-900 dark:text-gray-100" : "text-white"}>{call.city}</span>
              <span className="text-gray-400">•</span>
              <span className={isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-400"}>{call.rk}</span>
            </div>
            {call.avitoName && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs max-w-[150px] truncate",
                  isV2 
                    ? "border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/5 dark:bg-[#FEC004]/10" 
                    : "border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/5"
                )}
                title={call.avitoName}
              >
                {call.avitoName}
              </Badge>
            )}
          </div>
        )}
      </TableCell>

      {/* Колонка 3: Дата и время */}
      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
        <div className="space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 text-xs sm:text-sm">
            {!isV2 && <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-500 hidden sm:block" />}
            <span className={cn("hidden sm:inline", isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-400")}>{formatDate(call.createdAt)}</span>
            <span className={cn("font-medium", isV2 ? "text-gray-900 dark:text-gray-100" : "text-white")}>{formatTime(call.createdAt)}</span>
            <span className={cn("sm:hidden text-[10px]", isV2 ? "text-gray-500 dark:text-gray-400" : "text-gray-400")}>{formatDate(call.createdAt)}</span>
          </div>
          {duration && (
            <div className={cn("text-[10px] sm:text-xs font-mono", isV2 ? "text-gray-500 dark:text-gray-400" : "text-gray-500 sm:pl-5")}>
              <span className="hidden sm:inline">Длительность: </span>{duration}
            </div>
          )}
        </div>
      </TableCell>

      {/* Колонка 4: Оператор - скрыта на мобильных */}
      <TableCell className="hidden lg:table-cell py-3 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            <User className={cn("w-3.5 h-3.5 flex-shrink-0", isV2 ? "text-gray-400" : "text-gray-500")} />
            <span className={isV2 ? "text-gray-900 dark:text-gray-100" : "text-white"}>{call.operator.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Направление звонка */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs flex items-center gap-1",
                isV2 
                  ? isCallback 
                    ? "border-[#FEC004]/50 text-[#FEC004] bg-[#FEC004]/10" 
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                  : cn(directionConfig.borderColor, directionConfig.color)
              )}
            >
              <DirectionIcon className="w-3 h-3" />
              {directionConfig.label}
            </Badge>
            {/* Статус звонка */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                isV2 
                  ? "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                  : cn(statusConfig.borderColor, statusConfig.color)
              )}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </TableCell>

      {/* Колонка 5: Действия */}
      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          {isMainRow ? (
            <>
              {call.recordingPath && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayRecording(call)}
                    className={cn(
                      "h-7 w-7 sm:h-8 sm:w-8 p-0",
                      isPlaying 
                        ? isV2 
                          ? "text-[#FEC004] bg-[#FEC004]/20" 
                          : "text-[#FFD700] bg-[#FFD700]/20"
                        : isV2
                          ? "text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
                          : "text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                    )}
                    title="Прослушать"
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadRecording(call)}
                    className={cn(
                      "h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex",
                      isV2 
                        ? "text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
                        : "text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                    )}
                    title="Скачать"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                onClick={() => onCreateOrder(call, groupCalls)}
                className={cn(
                  "h-7 sm:h-8 font-medium px-2 sm:px-3 text-xs sm:text-sm",
                  isV2 
                    ? "bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900"
                    : "bg-[#FFD700] hover:bg-[#FFC700] text-[#0f0f23]"
                )}
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Новый заказ</span>
              </Button>
            </>
          ) : (
            call.recordingPath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayRecording(call)}
                className={cn(
                  "h-6 w-6 sm:h-7 sm:w-7 p-0",
                  isV2 
                    ? "text-gray-500 dark:text-gray-400 hover:text-[#FEC004]"
                    : "text-gray-500 hover:text-[#FFD700]"
                )}
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
