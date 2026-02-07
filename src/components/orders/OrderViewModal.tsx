'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { useFileUrl } from '@/lib/s3-utils';
import { 
  FileText, 
  X,
  Play,
  Edit,
  History,
  RefreshCw
} from 'lucide-react';
import { Order, Call, OrderHistoryItem } from '@/types/orders';
import { STATUS_LABELS, STATUS_COLORS, STATUS_COLORS_V2 } from '@/constants/orders';
import { useDesignStore } from '@/store/designStore';
import api from '@/lib/api';

type ViewTab = 'info' | 'documents' | 'history';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  orderCalls: Call[];
  loadingCalls: boolean;
  loadRecording: (call: Call) => void;
  skipBackward?: () => void;
  skipForward?: () => void;
  seekTo?: (time: number) => void;
  setVolume?: (volume: number) => void;
  formatDate: (date: string | number) => string;
  onEdit?: () => void;
}

const OrderViewModalComponent = ({ 
  isOpen, 
  onClose, 
  order, 
  orderCalls, 
  loadingCalls,
  loadRecording,
  formatDate,
  onEdit
}: OrderViewModalProps) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('info');
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { version } = useDesignStore();
  const isV2 = version === 'v2';

  // Сброс состояния при смене заказа
  useEffect(() => {
    setHistory([]);
    setActiveTab('info');
  }, [order?.id]);

  // Загрузка истории при переключении на вкладку
  useEffect(() => {
    if (activeTab === 'history' && order && history.length === 0) {
      loadHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, order?.id]);

  const loadHistory = async () => {
    if (!order) return;
    setLoadingHistory(true);
    try {
      const response = await api.get(`/orders/${order.id}/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !order) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div 
      className="fixed inset-x-0 top-16 bottom-0 lg:inset-0 z-50 flex lg:items-center justify-center lg:bg-black/50 lg:p-4"
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full lg:h-auto lg:max-h-[85vh] lg:rounded-lg overflow-hidden flex flex-col ${isV2 
          ? "bg-[#F3F3EE] dark:bg-[#1e2530] shadow-xl dark:shadow-none lg:max-w-3xl lg:border border-gray-200 dark:border-gray-700 font-myriad"
          : "bg-[#0f0f23] shadow-[0_0_30px_rgba(255,215,0,0.2)] lg:max-w-3xl lg:border-2 border-[#FFD700]/50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={isV2 
          ? "flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]"
          : "flex items-center justify-between px-4 py-3 border-b border-[#FFD700]/30 bg-[#17212b]"
        }>
          <h2 className={`text-lg font-bold ${isV2 ? "text-gray-900 dark:text-gray-100" : "text-[#FFD700]"}`}>
            Заказ #{order.id}
          </h2>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className={isV2 
                  ? "h-9 w-9 p-0 text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
                  : "h-9 w-9 p-0 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                }
                title="Редактировать"
              >
                <Edit className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={isV2 
                ? "h-9 w-9 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                : "h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
              }
              title="Закрыть"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className={isV2 
          ? "flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a] px-2"
          : "flex border-b border-[#FFD700]/30 bg-[#17212b]/50 px-2"
        }>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400')
            }`}
          >
            Информация
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400')
            }`}
          >
            Документы
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400')
            }`}
          >
            История
          </button>
        </div>
      
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'info' && (
            <InfoTab 
              order={order}
              orderCalls={orderCalls}
              loadingCalls={loadingCalls}
              loadRecording={loadRecording}
              formatDate={formatDate}
              isV2={isV2}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab order={order} formatDate={formatDate} isV2={isV2} />
          )}

          {activeTab === 'history' && (
            <HistoryTab 
              history={history} 
              loading={loadingHistory} 
              onRefresh={loadHistory}
              isV2={isV2} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Вкладка "Информация"
const InfoTab = ({ 
  order,
  orderCalls,
  loadingCalls,
  loadRecording,
  formatDate,
  isV2
}: { 
  order: Order;
  orderCalls: Call[];
  loadingCalls: boolean;
  loadRecording: (call: Call) => void;
  formatDate: (date: string | number) => string;
  isV2: boolean;
}) => {
  const statusColors = isV2 ? STATUS_COLORS_V2 : STATUS_COLORS;
  
  return (
    <div className="flex flex-col">
      {/* Две колонки: Заказ | Мастер и финансы */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 sm:divide-x ${isV2 ? 'divide-gray-200 dark:divide-gray-700' : 'divide-[#FFD700]/20'}`}>
        {/* Левая колонка — информация по заказу */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className={`text-base font-semibold ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'}`}>Информация по заказу</h3>
          </div>
          
          {/* Бейджи статуса и типа */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge 
              className={`text-xs px-2.5 py-1 ${statusColors[order.statusOrder as keyof typeof statusColors] || (isV2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-gray-800 text-gray-300')}`}
            >
              {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
            </Badge>
            <Badge variant="outline" className={`text-xs px-2.5 py-1 ${isV2 
              ? "border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/10 dark:bg-[#FEC004]/5"
              : "border-[#FFD700]/30 text-[#FFD700]"
            }`}>
              {order.typeEquipment}
            </Badge>
          </div>
          
          <DataRow label="Тип заявки" value={order.typeOrder} isV2={isV2} />
          <DataRow label="РК" value={order.rk} isV2={isV2} />
          <DataRow label="Источник" value={order.avitoName || '—'} muted={!order.avitoName} isV2={isV2} />
          <DataRow label="Город" value={order.city} isV2={isV2} />
          <DataRow label="Клиент" value={order.clientName} isV2={isV2} />
          <DataRow label="Телефон" value={order.phone || '—'} muted={!order.phone} isV2={isV2} />
          <DataRow label="Дата встречи" value={formatDate(order.dateMeeting)} isV2={isV2} />
          <DataRow label="Адрес" value={order.address} isV2={isV2} />
          <DataRow label="Проблема" value={order.problem} isV2={isV2} />
        </div>

        {/* Правая колонка — мастер и финансы */}
        <div className={`p-4 space-y-1 border-t sm:border-t-0 ${isV2 ? 'border-gray-200 dark:border-gray-700' : 'border-[#FFD700]/20'}`}>
          <h3 className={`text-base font-semibold ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'} mb-4`}>Мастер и финансы</h3>
          
          <DataRow label="Мастер" value={order.master?.name || 'Не назначен'} muted={!order.master?.name} isV2={isV2} />
          
          <div className="h-3" />
          
          <DataRow label="Итог" value={order.result ? `${order.result.toLocaleString()} ₽` : '—'} muted={!order.result} isV2={isV2} />
          <DataRow label="Расходы" value={order.expenditure ? `${order.expenditure.toLocaleString()} ₽` : '—'} muted={!order.expenditure} isV2={isV2} />
          <DataRow label="Чистая" value={order.clean ? `${order.clean.toLocaleString()} ₽` : '—'} muted={!order.clean} isV2={isV2} />
        </div>
      </div>

      {/* Оператор */}
      <div className={isV2 
        ? "px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a] flex items-center"
        : "px-4 py-3 border-t border-[#FFD700]/20 bg-[#17212b]/30 flex items-center justify-between"
      }>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>Оператор:</span>
          <span className={`text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>{order.operator.name}</span>
        </div>
      </div>

      {/* Записи звонков */}
      <div className={`px-4 py-3 border-t ${isV2 ? 'border-gray-200 dark:border-gray-700' : 'border-[#FFD700]/20'}`}>
        <h3 className={`text-base font-semibold ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'} mb-3`}>Записи звонков</h3>
        
        {loadingCalls ? (
          <div className={isV2 
            ? "flex items-center gap-2 p-3 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
            : "flex items-center gap-2 p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
          }>
            <LoadingSpinner size="sm" />
            <span className={`text-sm ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>Загрузка...</span>
          </div>
        ) : orderCalls.length > 0 ? (
          <div className="space-y-2">
            {orderCalls.map((call, index) => (
              <CallPlayer
                key={call.id || index}
                call={call}
                audioPlayer={null}
                loadRecording={loadRecording}
                togglePlayPause={() => {}}
                skipBackward={() => {}}
                skipForward={() => {}}
                seekTo={() => {}}
                setVolume={() => {}}
                stopPlayback={() => {}}
                formatTime={() => ''}
                isV2={isV2}
              />
            ))}
          </div>
        ) : (
          <div className={isV2 
            ? "p-3 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700 text-center"
            : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 text-center"
          }>
            <span className={`text-sm ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>Записи не найдены</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Вкладка "Документы"
const DocumentsTab = ({ order, formatDate, isV2 }: { order: Order; formatDate: (date: string) => string; isV2: boolean }) => (
  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
    {/* Документы в 2 колонки на десктопе, 1 на мобильных */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <h3 className={`text-xs sm:text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'} mb-2 sm:mb-3`}>
          БСО документы {order.bsoDoc?.length ? `(${order.bsoDoc.length})` : ''}
        </h3>
        {order.bsoDoc && order.bsoDoc.length > 0 ? (
          <div className="space-y-1.5 sm:space-y-2">
            {order.bsoDoc.map((doc, index) => (
              <DocumentPreview key={index} fileKey={doc} index={index} isV2={isV2} />
            ))}
          </div>
        ) : (
          <div className={isV2 
            ? "flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-[#252d3a] rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
            : "flex items-center justify-center p-4 sm:p-6 bg-[#17212b] rounded-lg border border-dashed border-gray-700"
          }>
            <span className={`text-xs sm:text-sm ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>Нет документов</span>
          </div>
        )}
      </div>

      <div>
        <h3 className={`text-xs sm:text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'} mb-2 sm:mb-3`}>
          Документы расходов {order.expenditureDoc?.length ? `(${order.expenditureDoc.length})` : ''}
        </h3>
        {order.expenditureDoc && order.expenditureDoc.length > 0 ? (
          <div className="space-y-1.5 sm:space-y-2">
            {order.expenditureDoc.map((doc, index) => (
              <DocumentPreview key={index} fileKey={doc} index={index} isV2={isV2} />
            ))}
          </div>
        ) : (
          <div className={isV2 
            ? "flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-[#252d3a] rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
            : "flex items-center justify-center p-4 sm:p-6 bg-[#17212b] rounded-lg border border-dashed border-gray-700"
          }>
            <span className={`text-xs sm:text-sm ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>Нет документов</span>
          </div>
        )}
      </div>
    </div>

  </div>
);

// Вкладка "История"
const HistoryTab = ({ 
  history, 
  loading, 
  onRefresh,
  isV2 
}: { 
  history: OrderHistoryItem[]; 
  loading: boolean;
  onRefresh: () => void;
  isV2: boolean;
}) => {
  const getEventLabel = (eventType: string) => {
    const labels: Record<string, { text: string }> = {
      'order.create': { text: 'Создание заказа' },
      'order.update': { text: 'Изменение заказа' },
      'order.close': { text: 'Закрытие заказа' },
      'order.status.change': { text: 'Смена статуса' },
    };
    return labels[eventType] || { text: eventType };
  };

  const formatChanges = (metadata: OrderHistoryItem['metadata']) => {
    if (!metadata) return null;

    const changes: React.ReactNode[] = [];

    // Изменение статуса
    if (metadata.oldStatus && metadata.newStatus) {
      changes.push(
        <span key="status" className={isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300'}>
          Статус: <span className={isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}>{metadata.oldStatus}</span>
          {' → '}
          <span className={isV2 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-white font-medium'}>{metadata.newStatus}</span>
        </span>
      );
    }

    // Закрытие заказа
    if (metadata.result) {
      changes.push(
        <span key="result" className={isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300'}>
          Итог: <span className={isV2 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-white font-medium'}>{metadata.result} ₽</span>
        </span>
      );
    }

    // Другие изменения
    if (metadata.changes) {
      const fieldLabels: Record<string, string> = {
        statusOrder: 'Статус',
        masterId: 'Мастер',
        address: 'Адрес',
        phone: 'Телефон',
        clientName: 'Клиент',
        dateMeeting: 'Дата встречи',
        problem: 'Проблема',
      };

      Object.entries(metadata.changes).forEach(([field, change]) => {
        if (change && typeof change === 'object' && 'old' in change && 'new' in change) {
          const label = fieldLabels[field] || field;
          let oldVal = change.old ?? '—';
          let newVal = change.new ?? '—';
          
          // Форматируем даты
          if (field === 'dateMeeting' && oldVal !== '—') {
            oldVal = new Date(oldVal as string).toLocaleString('ru-RU');
          }
          if (field === 'dateMeeting' && newVal !== '—') {
            newVal = new Date(newVal as string).toLocaleString('ru-RU');
          }

          changes.push(
            <span key={field} className={isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300'}>
              {label}: <span className={isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}>{String(oldVal)}</span>
              {' → '}
              <span className={isV2 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-white font-medium'}>{String(newVal)}</span>
            </span>
          );
        }
      });
    }

    return changes.length > 0 ? changes : null;
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-[#FFD700]'}`}>
          История изменений
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className={isV2 
            ? "h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
            : "h-8 px-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
          }
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className={isV2 
          ? "flex items-center justify-center py-8 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
          : "flex items-center justify-center py-8 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
        }>
          <LoadingSpinner size="md" />
        </div>
      ) : history.length === 0 ? (
        <div className={isV2 
          ? "flex flex-col items-center justify-center py-8 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
          : "flex flex-col items-center justify-center py-8 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
        }>
          <History className={`w-8 h-8 mb-2 ${isV2 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600'}`} />
          <span className={`text-sm ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>История пуста</span>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const eventConfig = getEventLabel(item.eventType);
            const changes = formatChanges(item.metadata);
            
            return (
              <div 
                key={item.id}
                className={isV2 
                  ? "p-3 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
                  : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>
                      {eventConfig.text}
                    </div>
                    {changes && (
                      <div className="mt-1 space-y-0.5 text-sm">
                        {changes.map((change, idx) => (
                          <div key={idx}>{change}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>
                      {formatDateTime(item.timestamp)}
                    </div>
                    {(item.userName || item.login) && (
                      <div className={`text-xs mt-0.5 ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>
                        {item.userName || item.login}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// === Вспомогательные компоненты ===

const DataRow = ({ label, value, muted = false, isV2 = false }: { label: string; value: string; muted?: boolean; isV2?: boolean }) => (
  <div className="flex justify-between items-start gap-3 py-1">
    <span className={`text-sm ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'} shrink-0`}>{label}</span>
    <span className={`text-sm text-right break-words min-w-0 ${muted ? (isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500') : (isV2 ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-white font-medium')}`}>{value}</span>
  </div>
);

const DocumentPreview = ({ fileKey, index, isV2 = false }: { fileKey: string; index: number; isV2?: boolean }) => {
  const { url, loading } = useFileUrl(fileKey);
  
  if (loading) {
    return (
      <div className={isV2 
        ? "flex items-center justify-center p-4 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
        : "flex items-center justify-center p-4 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
      }>
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  return (
    <a 
      href={url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className={isV2 
        ? "flex items-center gap-3 p-3 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-[#FEC004]/10 hover:border-[#FEC004]/30 transition-colors"
        : "flex items-center gap-3 p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 hover:bg-[#FFD700]/10 transition-colors"
      }
    >
      <FileText className={isV2 ? "h-5 w-5 text-[#FEC004]" : "h-5 w-5 text-[#FFD700]"} />
      <span className={`text-sm flex-1 ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>Документ #{index + 1}</span>
      <span className={`text-xs ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>↗</span>
    </a>
  );
};

const CallPlayer = ({
  call,
  loadRecording,
  isV2 = false,
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
  isV2?: boolean;
}) => {
  // Format date - handle both createdAt and dateCreate
  const callDate = (call as unknown as { createdAt?: string; dateCreate?: string }).createdAt || 
                   (call as unknown as { dateCreate?: string }).dateCreate;

  return (
    <div className={isV2 
      ? "p-3 bg-white dark:bg-[#252d3a] rounded-lg border border-gray-200 dark:border-gray-700"
      : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
    }>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>Звонок #{call.id}</span>
          {callDate && (
            <span className={`text-xs ${isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500'}`}>
              {new Date(callDate).toLocaleString('ru-RU')}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadRecording(call)}
          className={`shrink-0 ${isV2 
            ? "h-10 w-10 p-0 text-[#FEC004] hover:bg-[#FEC004]/10 border border-[#FEC004]/30 rounded-full"
            : "h-10 w-10 p-0 text-[#FFD700] hover:bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full"
          }`}
          title="Воспроизвести запись"
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

OrderViewModalComponent.displayName = 'OrderViewModal';
export const OrderViewModal = React.memo(OrderViewModalComponent);
