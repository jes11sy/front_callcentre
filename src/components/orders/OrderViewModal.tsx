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
  Plus,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  User
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div 
        className={isV2 
          ? "bg-[#F3F3EE] rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200 flex flex-col font-myriad"
          : "bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.2)] w-full max-w-3xl max-h-[85vh] overflow-hidden border-2 border-[#FFD700]/50 flex flex-col"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={isV2 
          ? "flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white"
          : "flex items-center justify-between px-5 py-3 border-b border-[#FFD700]/30 bg-[#17212b]"
        }>
          <h2 className={isV2 ? "text-lg font-bold text-gray-900" : "text-lg font-bold text-[#FFD700]"}>
            Заказ #{order.id}
          </h2>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className={isV2 
                  ? "h-8 px-2 text-gray-500 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
                  : "h-8 px-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={isV2 
                ? "h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                : "h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
              }
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className={isV2 
          ? "flex border-b border-gray-200 bg-white px-2"
          : "flex border-b border-[#FFD700]/30 bg-[#17212b]/50 px-2"
        }>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200')
            }`}
          >
            Информация
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200')
            }`}
          >
            Документы
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? (isV2 ? 'text-[#FEC004] border-b-2 border-[#FEC004] -mb-px' : 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px')
                : (isV2 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200')
            }`}
          >
            <History className="w-4 h-4" />
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
      <div className={`grid grid-cols-2 divide-x ${isV2 ? 'divide-gray-200' : 'divide-[#FFD700]/20'}`}>
        {/* Левая колонка — информация по заказу */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'}`}>Информация по заказу</h3>
            <div className="flex items-center gap-2">
              <Badge 
                className={`text-xs ${statusColors[order.statusOrder as keyof typeof statusColors] || (isV2 ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300')}`}
              >
                {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
              </Badge>
              <Badge variant="outline" className={isV2 
                ? "text-xs border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/10"
                : "text-xs border-[#FFD700]/30 text-[#FFD700]"
              }>
                {order.typeEquipment}
              </Badge>
            </div>
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
        <div className="p-4 space-y-2">
          <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'} mb-3`}>Мастер и финансы</h3>
          
          <DataRow label="Мастер" value={order.master?.name || 'Не назначен'} muted={!order.master?.name} isV2={isV2} />
          {order.masterId && <DataRow label="ID мастера" value={String(order.masterId)} isV2={isV2} />}
          
          <div className="h-2" />
          
          <DataRow label="Итог" value={order.result ? `${order.result.toLocaleString()} ₽` : '—'} muted={!order.result} isV2={isV2} />
          <DataRow label="Расходы" value={order.expenditure ? `${order.expenditure.toLocaleString()} ₽` : '—'} muted={!order.expenditure} isV2={isV2} />
          <DataRow label="Чистая" value={order.clean ? `${order.clean.toLocaleString()} ₽` : '—'} muted={!order.clean} isV2={isV2} />
        </div>
      </div>

      {/* Оператор */}
      <div className={isV2 
        ? "px-4 py-3 border-t border-gray-200 bg-white flex items-center"
        : "px-4 py-3 border-t border-[#FFD700]/20 bg-[#17212b]/30 flex items-center justify-between"
      }>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isV2 ? 'text-gray-500' : 'text-gray-400'}`}>Оператор:</span>
          <span className={`text-sm ${isV2 ? 'text-gray-900' : 'text-white'}`}>{order.operator.name}</span>
        </div>
        {!isV2 && <span className="text-xs text-gray-500">ID: {order.operatorNameId}</span>}
      </div>

      {/* Записи звонков */}
      <div className={`px-4 py-3 border-t ${isV2 ? 'border-gray-200' : 'border-[#FFD700]/20'}`}>
        <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'} mb-3`}>Записи звонков</h3>
        
        {loadingCalls ? (
          <div className={isV2 
            ? "flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200"
            : "flex items-center gap-2 p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
          }>
            <LoadingSpinner size="sm" />
            <span className={`text-sm ${isV2 ? 'text-gray-500' : 'text-gray-400'}`}>Загрузка записей...</span>
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
            ? "p-3 bg-white rounded-lg border border-gray-200 text-center"
            : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 text-center"
          }>
            <span className={`text-sm ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>Записи не найдены</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Вкладка "Документы"
const DocumentsTab = ({ order, formatDate, isV2 }: { order: Order; formatDate: (date: string) => string; isV2: boolean }) => (
  <div className="p-4 space-y-4">
    {/* Документы в 2 колонки */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'} mb-3`}>
          БСО документы {order.bsoDoc?.length ? `(${order.bsoDoc.length})` : ''}
        </h3>
        {order.bsoDoc && order.bsoDoc.length > 0 ? (
          <div className="space-y-2">
            {order.bsoDoc.map((doc, index) => (
              <DocumentPreview key={index} fileKey={doc} index={index} isV2={isV2} />
            ))}
          </div>
        ) : (
          <div className={isV2 
            ? "flex items-center justify-center p-6 bg-white rounded-lg border border-dashed border-gray-300"
            : "flex items-center justify-center p-6 bg-[#17212b] rounded-lg border border-dashed border-gray-700"
          }>
            <span className={`text-sm ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>Нет документов</span>
          </div>
        )}
      </div>

      <div>
        <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'} mb-3`}>
          Документы расходов {order.expenditureDoc?.length ? `(${order.expenditureDoc.length})` : ''}
        </h3>
        {order.expenditureDoc && order.expenditureDoc.length > 0 ? (
          <div className="space-y-2">
            {order.expenditureDoc.map((doc, index) => (
              <DocumentPreview key={index} fileKey={doc} index={index} isV2={isV2} />
            ))}
          </div>
        ) : (
          <div className={isV2 
            ? "flex items-center justify-center p-6 bg-white rounded-lg border border-dashed border-gray-300"
            : "flex items-center justify-center p-6 bg-[#17212b] rounded-lg border border-dashed border-gray-700"
          }>
            <span className={`text-sm ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>Нет документов</span>
          </div>
        )}
      </div>
    </div>

    {/* Системная информация */}
    <div className={isV2 
      ? "p-3 bg-white rounded-lg border border-gray-200"
      : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
    }>
      <h3 className={`text-xs font-medium ${isV2 ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Системная информация</h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <div className="flex justify-between">
          <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>Создан:</span>
          <span className={isV2 ? 'text-gray-900' : 'text-white'}>{formatDate(order.createDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>Обновлён:</span>
          <span className={isV2 ? 'text-gray-900' : 'text-white'}>{order.updatedAt ? formatDate(order.updatedAt) : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>ID заказа:</span>
          <span className={isV2 ? 'text-gray-900' : 'text-white'}>#{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>ID оператора:</span>
          <span className={isV2 ? 'text-gray-900' : 'text-white'}>{order.operatorNameId}</span>
        </div>
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
    const labels: Record<string, { text: string; icon: React.ReactNode; color: string }> = {
      'order.create': { 
        text: 'Создание заказа', 
        icon: <Plus className="w-4 h-4" />,
        color: isV2 ? 'text-green-600 bg-green-50' : 'text-green-400 bg-green-500/10'
      },
      'order.update': { 
        text: 'Изменение заказа', 
        icon: <RefreshCw className="w-4 h-4" />,
        color: isV2 ? 'text-blue-600 bg-blue-50' : 'text-blue-400 bg-blue-500/10'
      },
      'order.close': { 
        text: 'Закрытие заказа', 
        icon: <CheckCircle className="w-4 h-4" />,
        color: isV2 ? 'text-purple-600 bg-purple-50' : 'text-purple-400 bg-purple-500/10'
      },
      'order.status.change': { 
        text: 'Смена статуса', 
        icon: <ArrowRight className="w-4 h-4" />,
        color: isV2 ? 'text-orange-600 bg-orange-50' : 'text-orange-400 bg-orange-500/10'
      },
    };
    return labels[eventType] || { text: eventType, icon: null, color: '' };
  };

  const formatChanges = (metadata: OrderHistoryItem['metadata']) => {
    if (!metadata) return null;

    const changes: React.ReactNode[] = [];

    // Изменение статуса
    if (metadata.oldStatus && metadata.newStatus) {
      changes.push(
        <span key="status" className={isV2 ? 'text-gray-700' : 'text-gray-300'}>
          Статус: <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>{metadata.oldStatus}</span>
          {' → '}
          <span className={isV2 ? 'text-gray-900 font-medium' : 'text-white font-medium'}>{metadata.newStatus}</span>
        </span>
      );
    }

    // Закрытие заказа
    if (metadata.result) {
      changes.push(
        <span key="result" className={isV2 ? 'text-gray-700' : 'text-gray-300'}>
          Итог: <span className={isV2 ? 'text-gray-900 font-medium' : 'text-white font-medium'}>{metadata.result} ₽</span>
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
            <span key={field} className={isV2 ? 'text-gray-700' : 'text-gray-300'}>
              {label}: <span className={isV2 ? 'text-gray-400' : 'text-gray-500'}>{String(oldVal)}</span>
              {' → '}
              <span className={isV2 ? 'text-gray-900 font-medium' : 'text-white font-medium'}>{String(newVal)}</span>
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
        <h3 className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-[#FFD700]'}`}>
          История изменений
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className={isV2 
            ? "h-8 px-2 text-gray-500 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
            : "h-8 px-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
          }
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className={isV2 
          ? "flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200"
          : "flex items-center justify-center py-8 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
        }>
          <LoadingSpinner size="md" />
        </div>
      ) : history.length === 0 ? (
        <div className={isV2 
          ? "flex flex-col items-center justify-center py-8 bg-white rounded-lg border border-gray-200"
          : "flex flex-col items-center justify-center py-8 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
        }>
          <History className={`w-8 h-8 mb-2 ${isV2 ? 'text-gray-300' : 'text-gray-600'}`} />
          <span className={`text-sm ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>История пуста</span>
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
                  ? "p-3 bg-white rounded-lg border border-gray-200"
                  : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${eventConfig.color}`}>
                      {eventConfig.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-white'}`}>
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
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDateTime(item.timestamp)}
                    </div>
                    {item.login && (
                      <div className={`flex items-center gap-1 text-xs mt-0.5 ${isV2 ? 'text-gray-500' : 'text-gray-400'}`}>
                        <User className="w-3 h-3" />
                        {item.login}
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
  <div className="flex justify-between items-start">
    <span className={`text-xs ${isV2 ? 'text-gray-400' : 'text-gray-500'} shrink-0`}>{label}</span>
    <span className={`text-sm text-right ${muted ? (isV2 ? 'text-gray-400' : 'text-gray-500') : (isV2 ? 'text-gray-900' : 'text-white')}`}>{value}</span>
  </div>
);

const DocumentPreview = ({ fileKey, index, isV2 = false }: { fileKey: string; index: number; isV2?: boolean }) => {
  const { url, loading } = useFileUrl(fileKey);
  
  if (loading) {
    return (
      <div className={isV2 
        ? "flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200"
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
        ? "flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-[#FEC004]/10 hover:border-[#FEC004]/30 transition-colors"
        : "flex items-center gap-3 p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20 hover:bg-[#FFD700]/10 transition-colors"
      }
    >
      <FileText className={isV2 ? "h-5 w-5 text-[#FEC004]" : "h-5 w-5 text-[#FFD700]"} />
      <span className={`text-sm flex-1 ${isV2 ? 'text-gray-900' : 'text-white'}`}>Документ #{index + 1}</span>
      <span className={`text-xs ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>↗</span>
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
      ? "p-3 bg-white rounded-lg border border-gray-200"
      : "p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20"
    }>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isV2 ? 'text-gray-900' : 'text-white'}`}>Звонок #{call.id}</span>
          {callDate && (
            <span className={`text-xs ${isV2 ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(callDate).toLocaleString('ru-RU')}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadRecording(call)}
          className={isV2 
            ? "h-8 w-8 p-0 text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10"
            : "h-8 w-8 p-0 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10"
          }
          title="Воспроизвести запись"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

OrderViewModalComponent.displayName = 'OrderViewModal';
export const OrderViewModal = React.memo(OrderViewModalComponent);
