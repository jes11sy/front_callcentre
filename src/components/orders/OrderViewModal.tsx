'use client';

import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Info,
  Wrench
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.2)] w-full max-w-3xl max-h-[85vh] overflow-hidden border-2 border-[#FFD700]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FFD700]/30 bg-[#17212b]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FFD700]" />
              <h2 className="text-xl font-bold text-[#FFD700]">
                Заказ #{order.id}
              </h2>
            </div>
            <Badge 
              className={`${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-800 text-gray-300'}`}
            >
              {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
            </Badge>
            <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
              {order.typeEquipment}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#FFD700]/30 bg-[#17212b]/50 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
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
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] custom-scrollbar">
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
  <div className="space-y-4">
    {/* Две колонки с карточками */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Клиент */}
      <Card className="bg-[#17212b] border-[#FFD700]/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
            <User className="h-4 w-4 text-[#FFD700]" />
            Клиент
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label className="text-xs text-gray-500">Имя</Label>
            <p className="text-white font-medium">{order.clientName}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Телефон</Label>
            <p className="text-white flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500" />
              {order.phone || <span className="text-gray-500">Не указан</span>}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Тип заявки</Label>
            <p>
              <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700] text-xs">
                {order.typeOrder}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Детали */}
      <Card className="bg-[#17212b] border-[#FFD700]/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
            <Info className="h-4 w-4 text-[#FFD700]" />
            Детали
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">РК</Label>
              <p className="text-white">{order.rk}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Город</Label>
              <p className="text-white">{order.city}</p>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Источник</Label>
            <p className="text-white">{order.avitoName || <span className="text-gray-500">Не указан</span>}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Дата встречи</Label>
            <p className="text-white flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              {formatDate(order.dateMeeting)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Адрес */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
          <div>
            <Label className="text-xs text-gray-500">Адрес</Label>
            <p className="text-white">{order.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Проблема */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
          <Wrench className="h-4 w-4 text-[#FFD700]" />
          Описание проблемы
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-gray-300 whitespace-pre-wrap text-sm">{order.problem}</p>
      </CardContent>
    </Card>

    {/* Оператор и звонки */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
          <User className="h-4 w-4 text-[#FFD700]" />
          Оператор
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-white font-medium">{order.operator.name}</p>
          <span className="text-xs text-gray-500">ID: {order.operatorNameId}</span>
        </div>
        
        {/* Записи звонков */}
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">Записи звонков</Label>
          {loadingCalls ? (
            <div className="flex items-center gap-2 p-3 bg-[#0f0f23] rounded-lg border border-[#FFD700]/20">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-400">Загрузка записей...</span>
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
            <div className="p-3 bg-[#0f0f23] rounded-lg border border-[#FFD700]/20 text-center">
              <span className="text-sm text-gray-500">Записи не найдены</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Вкладка "Мастер"
const MasterTab = ({ order }: { order: Order }) => (
  <div className="space-y-4">
    {/* Информация о мастере */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
          <User className="h-4 w-4 text-[#FFD700]" />
          Мастер
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
            <User className="h-6 w-6 text-[#FFD700]" />
          </div>
          <div>
            <p className="text-white font-medium text-lg">
              {order.master?.name || <span className="text-gray-500">Не назначен</span>}
            </p>
            {order.masterId && (
              <p className="text-sm text-gray-500">ID: {order.masterId}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Финансы */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
          <Info className="h-4 w-4 text-[#FFD700]" />
          Финансовые результаты
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[#0f0f23] rounded-lg border border-green-500/20">
            <Label className="text-xs text-gray-500">Итог</Label>
            <p className="text-2xl font-bold text-green-400">
              {order.result ? `${order.result.toLocaleString()} ₽` : '—'}
            </p>
          </div>
          <div className="text-center p-4 bg-[#0f0f23] rounded-lg border border-red-500/20">
            <Label className="text-xs text-gray-500">Расходы</Label>
            <p className="text-2xl font-bold text-red-400">
              {order.expenditure ? `${order.expenditure.toLocaleString()} ₽` : '—'}
            </p>
          </div>
          <div className="text-center p-4 bg-[#0f0f23] rounded-lg border border-blue-500/20">
            <Label className="text-xs text-gray-500">Чистая</Label>
            <p className="text-2xl font-bold text-blue-400">
              {order.clean ? `${order.clean.toLocaleString()} ₽` : '—'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Вкладка "Документы"
const DocumentsTab = ({ order, formatDate }: { order: Order; formatDate: (date: string) => string }) => (
  <div className="space-y-4">
    {/* Документы */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-[#17212b] border-[#FFD700]/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
            <FileText className="h-4 w-4 text-green-400" />
            БСО документы {order.bsoDoc?.length ? `(${order.bsoDoc.length})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {order.bsoDoc && order.bsoDoc.length > 0 ? (
            <div className="space-y-2">
              {order.bsoDoc.map((doc, index) => (
                <DocumentPreview key={index} fileKey={doc} color="green" index={index} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-[#0f0f23] rounded-lg border border-dashed border-gray-700">
              <span className="text-sm text-gray-500">Нет документов</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#17212b] border-[#FFD700]/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
            <FileText className="h-4 w-4 text-blue-400" />
            Документы расходов {order.expenditureDoc?.length ? `(${order.expenditureDoc.length})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {order.expenditureDoc && order.expenditureDoc.length > 0 ? (
            <div className="space-y-2">
              {order.expenditureDoc.map((doc, index) => (
                <DocumentPreview key={index} fileKey={doc} color="blue" index={index} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-[#0f0f23] rounded-lg border border-dashed border-gray-700">
              <span className="text-sm text-gray-500">Нет документов</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Системная информация */}
    <Card className="bg-[#17212b] border-[#FFD700]/20">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
          <Info className="h-4 w-4 text-[#FFD700]" />
          Системная информация
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Дата создания:</span>
            <span className="text-white">{formatDate(order.createDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Последнее обновление:</span>
            <span className="text-white">{order.updatedAt ? formatDate(order.updatedAt) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ID заказа:</span>
            <span className="text-white">#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ID оператора:</span>
            <span className="text-white">{order.operatorNameId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// === Вспомогательные компоненты ===

const DocumentPreview = ({ fileKey, color, index }: { fileKey: string; color: 'green' | 'blue'; index: number }) => {
  const { url, loading } = useFileUrl(fileKey);
  
  const colors = {
    green: { border: 'border-green-500/30', bg: 'bg-green-900/20', text: 'text-green-300', hover: 'hover:bg-green-900/40' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-900/20', text: 'text-blue-300', hover: 'hover:bg-blue-900/40' },
  };
  const c = colors[color];
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${c.bg} rounded-lg border ${c.border}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  return (
    <a 
      href={url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-3 p-3 ${c.bg} rounded-lg border ${c.border} ${c.hover} transition-colors`}
    >
      <FileText className={`h-5 w-5 ${c.text}`} />
      <span className={`${c.text} text-sm flex-1`}>Документ #{index + 1}</span>
      <span className="text-xs text-gray-500">↗</span>
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
    <div className="p-3 bg-[#0f0f23] rounded-lg border border-[#FFD700]/20">
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
            variant="outline"
            size="sm"
            onClick={() => loadRecording(call)}
            className="h-7 px-3 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
          >
            <Play className="h-3 w-3 mr-1" />
            Воспроизвести
          </Button>
        )}
      </div>

      {isCurrentCall && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#FFD700]/20">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={skipBackward} className="h-7 w-7 p-0 text-[#FFD700] hover:bg-[#FFD700]/10">
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={togglePlayPause} className="h-7 w-7 p-0 text-[#FFD700] hover:bg-[#FFD700]/10">
              {player.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={skipForward} className="h-7 w-7 p-0 text-[#FFD700] hover:bg-[#FFD700]/10">
              <SkipForward className="h-3.5 w-3.5" />
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
              className="w-16 h-1 accent-[#FFD700]"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={stopPlayback} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

OrderViewModalComponent.displayName = 'OrderViewModal';
export const OrderViewModal = React.memo(OrderViewModalComponent);
