'use client';

import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Settings, 
  CheckCircle, 
  Info,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] w-[85vw] h-[80vh] overflow-y-auto border-2 border-[#FFD700]"
        style={{ 
          width: '85vw', 
          height: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#FFD700]/30">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-[#FFD700]">
              <FileText className="h-6 w-6 text-[#FFD700]" />
              Заказ #{order.id}
            </h2>
            <p className="text-gray-400 mt-1">
              Подробная информация о заказе
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
          >
            <span className="sr-only">Закрыть</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      
        <div className="space-y-6 p-6">
          {/* Статус и основные бейджи */}
          <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg border border-[#FFD700]/30">
            <div className="flex items-center gap-4">
              <Badge 
                className={`text-sm px-3 py-1 ${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-900/30 text-gray-300 border-gray-700'}`}
              >
                {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 border-[#FFD700]/30 text-[#FFD700]">
                {order.typeOrder}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 border-[#FFD700]/30 text-[#FFD700]">
                {order.typeEquipment}
              </Badge>
            </div>
            <div className="text-sm text-gray-400">
              Создан: {new Date(order.createDate).toLocaleDateString('ru-RU')}
            </div>
          </div>

          {/* Вкладки */}
          <div className="border-b border-[#FFD700]/30">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Описание
              </button>
              <button
                onClick={() => setActiveTab('master')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'master'
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Мастер
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Документы
              </button>
            </nav>
          </div>

          {/* Содержимое вкладок */}
          <div className="mt-6">
            {activeTab === 'description' && (
              <OrderDescriptionTab 
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
              <OrderMasterTab order={order} />
            )}

            {activeTab === 'documents' && (
              <OrderDocumentsTab order={order} formatDate={formatDate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для вкладки описания
const OrderDescriptionTab = ({ 
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
  <div className="space-y-6">
    {/* Основная информация в 2 колонки */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Левая колонка */}
      <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-[#FFD700]" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-400">РК</Label>
            <p className="text-lg font-semibold text-white">{order.rk}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Город</Label>
            <p className="text-lg text-white">{order.city}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Авито аккаунт</Label>
            <p className="text-lg text-white">{order.avitoName || <span className="text-gray-500">Не указан</span>}</p>
          </div>
        </CardContent>
      </Card>

      {/* Правая колонка */}
      <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-[#FFD700]" />
            Детали заказа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-400">Клиент</Label>
            <p className="text-lg font-semibold text-white">{order.clientName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Телефон</Label>
            <p className="text-lg flex items-center gap-2 text-white">
              <Phone className="h-4 w-4 text-gray-400" />
              {order.phone || <span className="text-gray-500">Не указан</span>}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Тип заказа</Label>
            <p className="text-lg">
              <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
                {order.typeOrder}
              </Badge>
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Адрес</Label>
            <p className="text-lg flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 text-gray-400" />
              {order.address}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Дата встречи</Label>
            <p className="text-lg flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(order.dateMeeting)}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Тип техники</Label>
            <p className="text-lg">
              <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
                {order.typeEquipment}
              </Badge>
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Статус</Label>
            <p className="text-lg">
              <Badge 
                className={`${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-900/30 text-gray-300 border-gray-700'}`}
              >
                {order.statusOrder}
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Описание проблемы */}
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <FileText className="h-5 w-5 text-[#FFD700]" />
          Описание проблемы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-[#0f0f23] p-4 rounded-lg border border-[#FFD700]/20">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {order.problem}
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Оператор */}
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-[#FFD700]" />
          Оператор
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-gray-400">Имя оператора</Label>
            <p className="text-lg font-semibold text-white">{order.operator.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">ID оператора</Label>
            <p className="text-lg font-mono text-white">{order.operatorNameId}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-400">Записи звонков</Label>
          <div className="mt-2 space-y-2">
            {loadingCalls ? (
              <div className="flex items-center gap-2 p-3 bg-[#0f0f23] border border-[#FFD700]/30 rounded-lg">
                <LoadingSpinner size="sm" className="text-gray-400" />
                <span className="text-gray-400">Загрузка записей...</span>
              </div>
            ) : orderCalls.length > 0 ? (
              orderCalls.map((call: Call, index: number) => {
                const isCurrentCall = (audioPlayer as { currentCallId?: string }).currentCallId === String(call.id);
                const _hasRecording = !!call.recordingPath;

                return (
                  <div key={call.id || index} className="p-3 bg-[#0f0f23] border border-[#FFD700]/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#FFD700]" />
                        <div>
                          <span className="text-white font-medium">Звонок #{call.id}</span>
                          <div className="text-xs text-gray-400">
                            {new Date(call.dateCreate).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      {!isCurrentCall && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadRecording(call)}
                          className="h-8 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Загрузить
                        </Button>
                      )}
                    </div>

                    {isCurrentCall && (
                      <div className="flex items-center gap-2 p-2 bg-[#17212b] rounded border border-[#FFD700]/30">
                        {/* Кнопки управления */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={skipBackward}
                            className="h-6 w-6 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
                          >
                            <SkipBack className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePlayPause}
                            className="h-6 w-6 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
                          >
                            {(audioPlayer as { isPlaying?: boolean }).isPlaying ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={skipForward}
                            className="h-6 w-6 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
                          >
                            <SkipForward className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Прогресс бар */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatTime((audioPlayer as { currentTime?: number }).currentTime || 0)}</span>
                            <div className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer"
                                 onClick={(e) => {
                                   const rect = e.currentTarget.getBoundingClientRect();
                                   const clickX = e.clientX - rect.left;
                                   const percentage = clickX / rect.width;
                                   const newTime = percentage * ((audioPlayer as { duration?: number }).duration || 0);
                                   seekTo(newTime);
                                 }}>
                              <div
                                className="bg-[#FFD700] h-1 rounded-full transition-all duration-100 progress-bar"
                                style={{ '--progress-width': `${((audioPlayer as { duration?: number }).duration || 0) > 0 ? (((audioPlayer as { currentTime?: number }).currentTime || 0) / ((audioPlayer as { duration?: number }).duration || 1)) * 100 : 0}%` } as React.CSSProperties}
                              />
                            </div>
                            <span>{formatTime((audioPlayer as { duration?: number }).duration || 0)}</span>
                          </div>
                        </div>

                        {/* Громкость */}
                        <div className="flex items-center gap-1">
                          <Volume2 className="h-3 w-3 text-gray-500" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={(audioPlayer as { volume?: number }).volume || 1}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-12 h-1"
                          />
                        </div>

                        {/* Кнопка остановки */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopPlayback}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-2 p-3 bg-[#0f0f23] border border-[#FFD700]/30 rounded-lg">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">Записи не найдены</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Компонент для вкладки мастера
const OrderMasterTab = ({ order }: { order: Order }) => (
  <div className="space-y-6">
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-[#FFD700]" />
          Информация о мастере
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-400">Имя мастера</Label>
            <p className="text-lg font-semibold text-white">{order.master?.name || <span className="text-gray-500">Не назначен</span>}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Мастер ID</Label>
            <p className="text-lg font-mono text-white">{order.masterId || <span className="text-gray-500">-</span>}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <CheckCircle className="h-5 w-5 text-[#FFD700]" />
          Финансовые результаты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-400">Итог</Label>
            <p className="text-2xl font-bold text-green-400">
              {order.result ? `${order.result} ₽` : <span className="text-gray-500">Не указан</span>}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Расходы</Label>
            <p className="text-2xl font-bold text-red-400">
              {order.expenditure ? `${order.expenditure} ₽` : <span className="text-gray-500">Не указаны</span>}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Чистая прибыль</Label>
            <p className="text-2xl font-bold text-blue-400">
              {order.clean ? `${order.clean} ₽` : <span className="text-gray-500">Не указана</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Компонент для вкладки документов
const OrderDocumentsTab = ({ order, formatDate }: { order: Order; formatDate: (date: string) => string }) => (
  <div className="space-y-6">
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <FileText className="h-5 w-5 text-[#FFD700]" />
          Документы заказа
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* БСО документ */}
          <div>
            <Label className="text-sm font-medium text-gray-400 mb-2 block">БСО документ</Label>
            {order.bsoDoc ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-green-500/30 bg-green-900/10">
                  <img 
                    src={order.bsoDoc} 
                    alt="БСО документ" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Если изображение не загрузилось, показываем placeholder
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full">
                          <div class="text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-gray-400 text-sm mt-2">Ошибка загрузки изображения</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
                <a 
                  href={order.bsoDoc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-green-900/30 border border-green-500/30 rounded-lg hover:bg-green-900/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-xs truncate">Открыть в новой вкладке</span>
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-video w-full p-6 bg-[#0f0f23] border-2 border-[#FFD700]/30 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-400">Документ не загружен</span>
                </div>
              </div>
            )}
          </div>

          {/* Документ расходов */}
          <div>
            <Label className="text-sm font-medium text-gray-400 mb-2 block">Документ расходов</Label>
            {order.expenditureDoc ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-blue-500/30 bg-blue-900/10">
                  <img 
                    src={order.expenditureDoc} 
                    alt="Документ расходов" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex items-center justify-center h-full">
                          <div class="text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-gray-400 text-sm mt-2">Ошибка загрузки изображения</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
                <a 
                  href={order.expenditureDoc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-blue-900/30 border border-blue-500/30 rounded-lg hover:bg-blue-900/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-blue-300 text-xs truncate">Открыть в новой вкладке</span>
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-video w-full p-6 bg-[#0f0f23] border-2 border-[#FFD700]/30 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-400">Документ не загружен</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Info className="h-5 w-5 text-[#FFD700]" />
          Системная информация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Дата создания:</span>
              <span className="font-medium text-white">{formatDate(order.createDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Последнее обновление:</span>
              <span className="font-medium text-white">{order.updatedAt ? formatDate(order.updatedAt) : 'Не указано'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">ID заказа:</span>
              <span className="font-medium text-white">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID оператора:</span>
              <span className="font-medium text-white">{order.operatorNameId}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Export the component
OrderViewModalComponent.displayName = 'OrderViewModal';
export const OrderViewModal = React.memo(OrderViewModalComponent);
