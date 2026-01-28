'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneMissed,
  Play,
  Plus,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Call } from '@/types/telephony';
import { cn } from '@/lib/utils';

interface CallCardProps {
  call: Call;
  callsInGroup: number;
  isSelected: boolean;
  onClick: () => void;
  onQuickPlay?: () => void;
  onQuickCreateOrder?: () => void;
}

export const CallCard: React.FC<CallCardProps> = ({
  call,
  callsInGroup,
  isSelected,
  onClick,
  onQuickPlay,
  onQuickCreateOrder
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
        borderColor: 'border-green-500/30'
      },
      missed: { 
        icon: PhoneMissed, 
        label: 'Пропущен', 
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      },
      busy: { 
        icon: Phone, 
        label: 'Занято', 
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      },
      no_answer: { 
        icon: Phone, 
        label: 'Нет ответа', 
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30'
      }
    };
    return configs[status as keyof typeof configs] || configs.no_answer;
  };

  const statusConfig = getStatusConfig(call.status);
  const StatusIcon = statusConfig.icon;
  const duration = formatDuration(call.duration);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
        "hover:border-[#FFD700]/50 hover:shadow-lg hover:shadow-[#FFD700]/5",
        isSelected 
          ? "bg-[#1a1a2e] border-[#FFD700] shadow-lg shadow-[#FFD700]/10" 
          : "bg-[#17212b] border-[#FFD700]/20",
        call.status === 'missed' && !isSelected && "border-l-4 border-l-red-500"
      )}
    >
      {/* Верхняя часть: телефон и статус */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            statusConfig.bgColor
          )}>
            <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[#FFD700] text-lg truncate">
              {call.phoneClient}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{call.city}</span>
              {call.avitoName && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="truncate text-[#FFD700]/70">{call.avitoName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Бейдж количества звонков */}
        {callsInGroup > 1 && (
          <Badge 
            variant="outline" 
            className="flex-shrink-0 border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/5"
          >
            +{callsInGroup - 1}
          </Badge>
        )}
      </div>

      {/* Средняя часть: время, статус, длительность */}
      <div className="flex items-center gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(call.dateCreate)}</span>
          <span className="text-gray-600">•</span>
          <span className="font-medium text-white">{formatTime(call.dateCreate)}</span>
        </div>
        
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            statusConfig.borderColor,
            statusConfig.color
          )}
        >
          {statusConfig.label}
        </Badge>

        {duration && (
          <span className="text-gray-400 font-mono text-xs">
            {duration}
          </span>
        )}
      </div>

      {/* Нижняя часть: оператор */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User className="w-3.5 h-3.5" />
          <span>{call.operator.name}</span>
        </div>

        {/* Быстрые действия (появляются при hover) */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-200",
          "opacity-0 group-hover:opacity-100",
          isSelected && "opacity-100"
        )}>
          {call.recordingPath && onQuickPlay && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickPlay();
              }}
              className="h-8 w-8 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          {onQuickCreateOrder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickCreateOrder();
              }}
              className="h-8 w-8 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Индикатор выбранной карточки */}
      {isSelected && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FFD700] rounded-l" />
      )}
    </div>
  );
};

CallCard.displayName = 'CallCard';
