'use client';

import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { useFileUrl } from '@/lib/s3-utils';
import { 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { Order, OrderTab, Call } from '@/types/orders';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants/orders';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  orderCalls: Call[];
  loadingCalls: boolean;
  loadRecording: (call: Call) => void;
  skipBackward: () => void;
  skipForward: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  formatDate: (date: string | number) => string;
}

const OrderViewModalComponent = ({ 
  isOpen, 
  onClose, 
  order, 
  orderCalls, 
  loadingCalls,
  loadRecording,
  skipBackward,
  skipForward,
  seekTo,
  setVolume,
  formatDate
}: OrderViewModalProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('description');
  const { 
    audioPlayer, 
    togglePlayPause, 
    stopPlayback, 
    formatTime 
  } = useAudioPlayer();

  if (!isOpen || !order) return null;

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  const tabs = [
    { id: 'description' as OrderTab, label: 'Информация', icon: FileText },
    { id: 'master' as OrderTab, label: 'Мастер', icon: Briefcase },
    { id: 'documents' as OrderTab, label: 'Документы', icon: FileText },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-[#FFD700]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFD700]/20 bg-[#17212b]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#FFD700]">
              Заказ #{order.id}
            </h2>
            <Badge 
              className={`text-xs ${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-800 text-gray-300'}`}
            >
              {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#FFD700]/20 bg-[#17212b]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      
        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-120px)] custom-scrollbar">
          {activeTab === 'description' && (
            <DescriptionTab 
              order={order}
              orderCalls={orderCalls}
              loadingCalls={loadingCalls}
              loadRecording={loadRecording}
              skipBackward={skipBackward}
              skipForward={skipForward}
              seekTo={seekTo}
              setVolume={setVolume}
              formatDate={formatDate}
              audioPlayer={audioPlayer}
              stopPlayback={stopPlayback}
              formatTime={formatTime}
              togglePlayPause={togglePlayPause}
            />
          )}

          {activeTab === 'master' && (
            <MasterTab order={order} />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab order={order} formatDate={formatDate} />
          )}
        </div>
      </div>
    </div>
  );
};

// Вкладка "Информация"
const DescriptionTab = ({ 
  order,
  orderCalls,
  loadingCalls,
  loadRecording,
  skipBackward,
  skipForward,
  seekTo,
  setVolume,
  formatDate,
  audioPlayer, 
  stopPlayback, 
  formatTime,
  togglePlayPause
}: { 
  order: Order;
  orderCalls: Call[];
  loadingCalls: boolean;
  loadRecording: (call: Call) => void;
  skipBackward: () => void;
  skipForward: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  formatDate: (date: string | number) => string;
  audioPlayer: unknown; 
  stopPlayback: () => void; 
  formatTime: (time: number) => string;
  togglePlayPause: () => void;
}) => (
  <div className="space-y-5">
    {/* Основная информация — компактная сетка */}
    <div className="grid grid-cols-2 gap-4">
      <InfoRow icon={User} label="Клиент" value={order.clientName} />
      <InfoRow icon={Phone} label="Телефон" value={order.phone || 'Не указан'} muted={!order.phone} />
      <InfoRow icon={MapPin} label="Город" value={order.city} />
      <InfoRow icon={Calendar} label="Дата встречи" value={formatDate(order.dateMeeting)} />
      <InfoRow label="РК" value={order.rk} />
      <InfoRow label="Источник" value={order.avitoName || 'Не указан'} muted={!order.avitoName} />
    </div>

    {/* Адрес */}
    <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <Label className="text-xs text-gray-400">Адрес</Label>
      <p className="text-sm text-white mt-1">{order.address}</p>
    </div>

    {/* Бейджи */}
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
        {order.typeOrder}
      </Badge>
      <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
        {order.typeEquipment}
      </Badge>
    </div>

    {/* Проблема */}
    <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <Label className="text-xs text-gray-400">Описание проблемы</Label>
      <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap">{order.problem}</p>
    </div>

    {/* Оператор */}
    <div className="flex items-center justify-between p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <div>
        <Label className="text-xs text-gray-400">Оператор</Label>
        <p className="text-sm text-white">{order.operator.name}</p>
      </div>
      <span className="text-xs text-gray-500">ID: {order.operatorNameId}</span>
    </div>

    {/* Записи звонков */}
    <div>
      <Label className="text-xs text-gray-400 mb-2 block">Записи звонков</Label>
      {loadingCalls ? (
        <div className="flex items-center gap-2 p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-400">Загрузка...</span>
        </div>
      ) : orderCalls.length > 0 ? (
        <div className="space-y-2">
          {orderCalls.map((call, index) => (
            <CallPlayer
              key={call.id || index}
              call={call}
              audioPlayer={audioPlayer}
              loadRecording={loadRecording}
              togglePlayPause={togglePlayPause}
              skipBackward={skipBackward}
              skipForward={skipForward}
              seekTo={seekTo}
              setVolume={setVolume}
              stopPlayback={stopPlayback}
              formatTime={formatTime}
            />
          ))}
        </div>
      ) : (
        <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 text-center">
          <span className="text-sm text-gray-500">Записи не найдены</span>
        </div>
      )}
    </div>
  </div>
);

// Вкладка "Мастер"
const MasterTab = ({ order }: { order: Order }) => (
  <div className="space-y-5">
    {/* Информация о мастере */}
    <div className="p-4 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
          <User className="h-5 w-5 text-[#FFD700]" />
        </div>
        <div>
          <p className="text-white font-medium">
            {order.master?.name || <span className="text-gray-500">Не назначен</span>}
          </p>
          {order.masterId && (
            <p className="text-xs text-gray-500">ID: {order.masterId}</p>
          )}
        </div>
      </div>
    </div>

    {/* Финансы */}
    <div>
      <Label className="text-xs text-gray-400 mb-3 block">Финансовые результаты</Label>
      <div className="grid grid-cols-3 gap-3">
        <FinanceCard 
          label="Итог" 
          value={order.result} 
          color="green"
        />
        <FinanceCard 
          label="Расходы" 
          value={order.expenditure} 
          color="red"
        />
        <FinanceCard 
          label="Чистая" 
          value={order.clean} 
          color="blue"
        />
      </div>
    </div>
  </div>
);

// Вкладка "Документы"
const DocumentsTab = ({ order, formatDate }: { order: Order; formatDate: (date: string) => string }) => (
  <div className="space-y-5">
    {/* Документы */}
    <div className="grid grid-cols-2 gap-4">
      <DocumentSection
        label="БСО документы"
        docs={order.bsoDoc}
        color="green"
      />
      <DocumentSection
        label="Документы расходов"
        docs={order.expenditureDoc}
        color="blue"
      />
    </div>

    {/* Системная информация */}
    <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <Label className="text-xs text-gray-400 mb-2 block">Системная информация</Label>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Создан:</span>
          <span className="text-gray-300">{formatDate(order.createDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Обновлён:</span>
          <span className="text-gray-300">{order.updatedAt ? formatDate(order.updatedAt) : '—'}</span>
        </div>
      </div>
    </div>
  </div>
);

// === Вспомогательные компоненты ===

const InfoRow = ({ 
  icon: Icon, 
  label, 
  value, 
  muted = false 
}: { 
  icon?: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string; 
  muted?: boolean;
}) => (
  <div className="flex items-start gap-2">
    {Icon && <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />}
    <div className="min-w-0">
      <Label className="text-xs text-gray-500">{label}</Label>
      <p className={`text-sm truncate ${muted ? 'text-gray-500' : 'text-white'}`}>{value}</p>
    </div>
  </div>
);

const FinanceCard = ({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value?: number; 
  color: 'green' | 'red' | 'blue';
}) => {
  const colors = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  };
  
  return (
    <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 text-center">
      <Label className="text-xs text-gray-500">{label}</Label>
      <p className={`text-lg font-bold ${value ? colors[color] : 'text-gray-600'}`}>
        {value ? `${value.toLocaleString()} ₽` : '—'}
      </p>
    </div>
  );
};

const DocumentSection = ({ 
  label, 
  docs, 
  color 
}: { 
  label: string; 
  docs?: string[]; 
  color: 'green' | 'blue';
}) => (
  <div>
    <Label className="text-xs text-gray-400 mb-2 block">
      {label} {docs && docs.length > 0 && `(${docs.length})`}
    </Label>
    {docs && docs.length > 0 ? (
      <div className="space-y-2">
        {docs.map((doc, index) => (
          <DocumentPreview key={index} fileKey={doc} color={color} />
        ))}
      </div>
    ) : (
      <div className="aspect-video flex items-center justify-center bg-[#17212b] rounded-lg border border-dashed border-gray-700">
        <span className="text-xs text-gray-500">Нет документов</span>
      </div>
    )}
  </div>
);

const DocumentPreview = ({ fileKey, color }: { fileKey: string; color: 'green' | 'blue' }) => {
  const { url, loading } = useFileUrl(fileKey);
  
  const borderColor = color === 'green' ? 'border-green-500/30' : 'border-blue-500/30';
  
  if (loading) {
    return (
      <div className={`aspect-video flex items-center justify-center bg-[#17212b] rounded-lg border ${borderColor}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  return (
    <a 
      href={url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block aspect-video rounded-lg overflow-hidden border ${borderColor} hover:border-opacity-60 transition-colors`}
    >
      <img 
        src={url || ''} 
        alt="Document" 
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </a>
  );
};

const CallPlayer = ({
  call,
  audioPlayer,
  loadRecording,
  togglePlayPause,
  skipBackward,
  skipForward,
  seekTo,
  setVolume,
  stopPlayback,
  formatTime,
}: {
  call: Call;
  audioPlayer: unknown;
  loadRecording: (call: Call) => void;
  togglePlayPause: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  stopPlayback: () => void;
  formatTime: (time: number) => string;
}) => {
  const isCurrentCall = (audioPlayer as { currentCallId?: string }).currentCallId === String(call.id);
  const player = audioPlayer as { isPlaying?: boolean; currentTime?: number; duration?: number; volume?: number };

  return (
    <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#FFD700]" />
          <span className="text-sm text-white">Звонок #{call.id}</span>
          <span className="text-xs text-gray-500">
            {new Date(call.dateCreate).toLocaleString('ru-RU')}
          </span>
        </div>
        {!isCurrentCall && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadRecording(call)}
            className="h-7 px-2 text-[#FFD700] hover:bg-[#FFD700]/10"
          >
            <Play className="h-3 w-3 mr-1" />
            Воспроизвести
          </Button>
        )}
      </div>

      {isCurrentCall && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#FFD700]/10">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={skipBackward} className="h-6 w-6 p-0 text-[#FFD700]">
              <SkipBack className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={togglePlayPause} className="h-6 w-6 p-0 text-[#FFD700]">
              {player.isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={skipForward} className="h-6 w-6 p-0 text-[#FFD700]">
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex-1 flex items-center gap-2 text-xs text-gray-400">
            <span className="w-10 text-right">{formatTime(player.currentTime || 0)}</span>
            <div 
              className="flex-1 bg-gray-700 rounded-full h-1.5 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percentage = (e.clientX - rect.left) / rect.width;
                seekTo(percentage * (player.duration || 0));
              }}
            >
              <div
                className="bg-[#FFD700] h-1.5 rounded-full transition-all"
                style={{ width: `${(player.duration || 0) > 0 ? ((player.currentTime || 0) / (player.duration || 1)) * 100 : 0}%` }}
              />
            </div>
            <span className="w-10">{formatTime(player.duration || 0)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Volume2 className="h-3 w-3 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={player.volume || 1}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-12 h-1 accent-[#FFD700]"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={stopPlayback} className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

OrderViewModalComponent.displayName = 'OrderViewModal';
export const OrderViewModal = React.memo(OrderViewModalComponent);
