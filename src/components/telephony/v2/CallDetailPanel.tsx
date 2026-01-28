'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneMissed,
  PhoneOutgoing,
  MapPin,
  User,
  Calendar,
  Clock,
  Building2,
  Tag,
  X,
  Plus,
  History,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Call } from '@/types/telephony';
import { cn } from '@/lib/utils';
import { SpotifyAudioPlayer } from '@/components/ui/spotify-audio-player';

interface CallDetailPanelProps {
  call: Call | null;
  callGroup: Call[];
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (call: Call, group: Call[]) => void;
  onLoadOrderHistory: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  onLoadRecording: (call: Call) => void;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onClosePlayer: () => void;
  orderHistoryLoading: boolean;
}

export const CallDetailPanel: React.FC<CallDetailPanelProps> = ({
  call,
  callGroup,
  isOpen,
  onClose,
  onCreateOrder,
  onLoadOrderHistory,
  onDownloadRecording,
  onLoadRecording,
  playingCall,
  currentAudioUrl,
  onClosePlayer,
  orderHistoryLoading
}) => {
  const [showAllCalls, setShowAllCalls] = React.useState(false);

  if (!isOpen || !call) {
    return null;
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
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
  const isCurrentCallPlaying = playingCall === call.id;

  return (
    <div className="h-full flex flex-col bg-[#17212b] border-l-2 border-[#FFD700]/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/20">
        <h2 className="text-lg font-semibold text-white">Детали звонка</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Основная информация о клиенте */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              statusConfig.bgColor
            )}>
              <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#FFD700]">
                {call.phoneClient}
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-xs mt-1", statusConfig.borderColor, statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Детали звонка */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Информация
          </h3>
          
          <div className="space-y-2">
            <DetailRow 
              icon={MapPin} 
              label="Город" 
              value={call.city} 
            />
            <DetailRow 
              icon={Building2} 
              label="РК" 
              value={call.rk} 
            />
            {call.avitoName && (
              <DetailRow 
                icon={Tag} 
                label="Источник" 
                value={call.avitoName}
                highlight 
              />
            )}
            <DetailRow 
              icon={PhoneOutgoing} 
              label="Номер АТС" 
              value={call.phoneAts} 
            />
            <DetailRow 
              icon={User} 
              label="Оператор" 
              value={call.operator.name} 
            />
            <DetailRow 
              icon={Calendar} 
              label="Дата" 
              value={formatDateTime(call.dateCreate)} 
            />
            <DetailRow 
              icon={Clock} 
              label="Длительность" 
              value={formatDuration(call.duration)} 
            />
          </div>
        </div>

        {/* Аудиоплеер */}
        {call.recordingPath && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Запись разговора
            </h3>
            
            <div className="space-y-2">
              {isCurrentCallPlaying && currentAudioUrl ? (
                <SpotifyAudioPlayer 
                  audioUrl={currentAudioUrl}
                  onError={() => onClosePlayer()}
                  className="bg-[#0f0f23] border-[#FFD700]/20"
                />
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onLoadRecording(call)}
                  className="w-full justify-start gap-2 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                >
                  <Phone className="w-4 h-4" />
                  Прослушать запись
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadRecording(call)}
                className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Download className="w-4 h-4" />
                Скачать запись
              </Button>
            </div>
          </div>
        )}

        {/* История звонков с этого номера */}
        {callGroup.length > 1 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAllCalls(!showAllCalls)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>История звонков ({callGroup.length})</span>
              {showAllCalls ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showAllCalls && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {callGroup.map((groupCall) => {
                  const groupStatusConfig = getStatusConfig(groupCall.status);
                  const GroupStatusIcon = groupStatusConfig.icon;
                  
                  return (
                    <div 
                      key={groupCall.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        groupCall.id === call.id 
                          ? "bg-[#FFD700]/10 border border-[#FFD700]/30" 
                          : "bg-[#0f0f23]/50"
                      )}
                    >
                      <GroupStatusIcon className={cn("w-4 h-4", groupStatusConfig.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white">
                          {formatTime(groupCall.dateCreate)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {groupCall.operator.name}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", groupStatusConfig.borderColor, groupStatusConfig.color)}
                      >
                        {groupStatusConfig.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer с действиями */}
      <div className="p-4 border-t border-[#FFD700]/20">
        <Button
          onClick={() => onCreateOrder(call, callGroup)}
          className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-[#0f0f23] font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новый заказ
        </Button>
      </div>
    </div>
  );
};

// Вспомогательный компонент для строки с деталями
interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-center gap-3 py-1.5">
    <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
    <span className="text-sm text-gray-400 min-w-[80px]">{label}</span>
    <span className={cn(
      "text-sm font-medium truncate",
      highlight ? "text-[#FFD700]" : "text-white"
    )}>
      {value}
    </span>
  </div>
);

CallDetailPanel.displayName = 'CallDetailPanel';
