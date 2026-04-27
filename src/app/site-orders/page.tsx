'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';
import { 
  Plus,
  Phone,
  User,
  MapPin,
  MessageSquare,
  Clock,
  AlarmClock,
  Loader2,

} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CreateOrderFromSiteModal from '@/components/site-orders/CreateOrderFromSiteModal';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import { LoadingState } from '@/components/ui/loading-state';
import {
  formControlResetClass,
  getFormDateFieldClass,
  getFormFieldClass,
  getFormSelectContentClass,
  getFormSelectItemClass,
  getFormSelectTriggerClass,
} from '@/components/ui/form-styles';
import { siteOrdersService } from '@/services';
import type { SiteOrder, SiteOrdersResponse } from '@/types/site-orders';


// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = ['Создан', 'В обработке', 'Перезвонить', 'Не отвечает', 'Отказ'] as const;

const isCallbackOverdue = (callbackAt: string | null): boolean => {
  if (!callbackAt) return false;
  return new Date(callbackAt) < new Date();
};

const formatCallbackTime = (callbackAt: string): string => {
  const date = new Date(callbackAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  
  if (diffMin < -60 * 24) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  if (diffMin < 0) return `просрочено на ${Math.abs(diffMin)} мин`;
  if (diffMin < 60) return `через ${diffMin} мин`;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Создан':
      return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30';
    case 'В обработке':
      return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30';
    case 'Перезвонить':
      return 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30';

    case 'Не отвечает':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20';
    case 'Отказ':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-400/20';
    default:
      return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-500/30';

  }
};

export default function SiteOrdersPage() {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedSiteOrder, setSelectedSiteOrder] = useState<SiteOrder | null>(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: number; value: string } | null>(null);
  const [callbackModal, setCallbackModal] = useState<{ id: number; value: string } | null>(null);
  const fieldClass = getFormFieldClass(isDark, 'md');
  const compactFieldClass = getFormFieldClass(isDark, 'sm');
  const selectTriggerClass = getFormSelectTriggerClass(isDark, 'md');
  const selectContentClass = getFormSelectContentClass(isDark);
  const selectItemClass = getFormSelectItemClass(isDark);
  const dateFieldClass = getFormDateFieldClass(isDark, 'md');

  // Fetch site orders
  const { data, isLoading, error } = useQuery<SiteOrdersResponse>({
    queryKey: ['site-orders', page, search, statusFilter],
    queryFn: async () => {
      return siteOrdersService.getSiteOrders({
        page,
        limit: 50,
        search,
        status: statusFilter,
      });
    },
  });
  const hasNetworkError = Boolean(error);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, callbackAt }: { id: number; status: string; callbackAt?: string }) => {
      return siteOrdersService.updateStatus(id, status, callbackAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-orders'] });
      toast.success('Статус обновлен');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  // Update operator comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, commentOperator }: { id: number; commentOperator: string }) => {
      return siteOrdersService.updateOperatorComment(id, commentOperator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-orders'] });
      setEditingComment(null);
      toast.success('Комментарий сохранен');
    },
    onError: () => {
      toast.error('Ошибка при сохранении комментария');
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    if (status === 'Перезвонить') {
      // Предлагаем выбрать время перезвона (по умолчанию через 30 минут)
      const defaultTime = new Date(Date.now() + 30 * 60000);
      const pad = (n: number) => String(n).padStart(2, '0');
      const localIso = `${defaultTime.getFullYear()}-${pad(defaultTime.getMonth() + 1)}-${pad(defaultTime.getDate())}T${pad(defaultTime.getHours())}:${pad(defaultTime.getMinutes())}`;
      setCallbackModal({ id, value: localIso });
    } else {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleConfirmCallback = () => {
    if (!callbackModal) return;
    const callbackAt = new Date(callbackModal.value).toISOString();
    updateStatusMutation.mutate({ id: callbackModal.id, status: 'Перезвонить', callbackAt });
    setCallbackModal(null);
  };

  const handleCreateOrder = (siteOrder: SiteOrder) => {
    setSelectedSiteOrder(siteOrder);
    setIsCreateOrderModalOpen(true);
  };

  const handleSaveComment = (id: number) => {
    if (editingComment && editingComment.id === id) {
      updateCommentMutation.mutate({ id, commentOperator: editingComment.value });
    }
  };

  if (isLoading && !data) {
    return (
      <DashboardLayout>
        <div className="w-full min-h-screen px-4 py-6 bg-[#f5f5f7] dark:bg-[#111113]">
          <LoadingState isDark={isDark} message="Загрузка заявок..." fullPage />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-6 px-4 min-h-screen bg-[#f5f5f7] dark:bg-[#111113] font-myriad">
        <div className="w-full">
          {hasNetworkError && (
            <div className={`mb-4 rounded-[16px] border px-4 py-3 text-sm ${
              isDark
                ? 'border-red-400/40 bg-red-500/10 text-red-100'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <span>Вы оффлайн или недоступен сервер. Интерфейс открыт, данные временно не обновляются.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className={isDark ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : ''}
                >
                  Повторить
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={`rounded-[20px] border p-4 mb-4 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Поиск по имени, телефону, сайту..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="w-[200px]">
                <Select value={statusFilter || ''} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    <SelectItem value="all" className={selectItemClass}>
                      Все статусы
                    </SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className={selectItemClass}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-[20px] border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'bg-white/[0.04] border-white/20' : 'bg-gray-50 border-gray-200'}`}>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Город
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Сайт
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Имя
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Телефон
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Статус</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Инфо с сайта
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        Комментарий КЦ
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((order) => (
                      <tr 
                        key={order.id} 
                        className={`border-b transition-colors ${isDark ? 'border-white/10 hover:bg-white/[0.04]' : 'border-gray-200 hover:bg-black/[0.02]'}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{order.city?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{order.site}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{order.clientName}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{order.phone}</td>
                        <td className="px-4 py-3">
                          {/* Индикатор дедлайна перезвона */}
                          {order.status === 'Перезвонить' && order.callbackAt && (
                            <div className={`flex items-center gap-1 mb-1.5 text-xs font-medium ${
                              isCallbackOverdue(order.callbackAt)
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              {isCallbackOverdue(order.callbackAt)
                                ? <AlarmClock className="h-3.5 w-3.5 flex-shrink-0" />
                                : <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                              }
                              <span>{formatCallbackTime(order.callbackAt)}</span>
                            </div>
                          )}
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={order.status === 'Заказ создан'}
                          >
                            <SelectTrigger 
                              className={`w-[150px] h-8 text-xs border ${formControlResetClass} ${getStatusColor(order.status)} bg-transparent [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={selectContentClass}>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem 
                                  key={status} 
                                  value={status} 
                                  className={selectItemClass}
                                >
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm max-w-[200px] whitespace-pre-line text-gray-500 dark:text-gray-400">
                            {order.comment || <span className="text-gray-400 dark:text-gray-500 italic">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {editingComment?.id === order.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingComment.value}
                                onChange={(e) => setEditingComment({ ...editingComment, value: e.target.value })}
                                className={`h-8 text-sm ${compactFieldClass}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveComment(order.id);
                                  if (e.key === 'Escape') setEditingComment(null);
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveComment(order.id)}
                                className={isDark ? 'h-8 bg-white text-[#111113] hover:bg-gray-100' : 'h-8 bg-[#0a4f42] text-white hover:bg-[#083f35]'}
                              >
                                ОК
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer min-h-[32px] flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                              onClick={() => setEditingComment({ id: order.id, value: order.commentOperator || '' })}
                            >
                              {order.commentOperator || <span className="text-gray-400 dark:text-gray-500 italic">Добавить...</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.status !== 'Заказ создан' ? (
                            <Button
                              size="sm"
                              onClick={() => handleCreateOrder(order)}
                              className={isDark ? 'h-8 bg-white hover:bg-gray-100 text-[#111113] font-semibold' : 'h-8 bg-[#0a4f42] hover:bg-[#083f35] text-white font-semibold'}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Заказ
                            </Button>
                          ) : (
                            <span className={isDark ? 'text-sm text-white/80' : 'text-sm text-[#0a4f42]'}>
                              Заказ #{order.orderId}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {hasNetworkError ? 'Нет данных: проверьте подключение к сети' : 'Заявки не найдены'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Показано {data.data.length} из {data.pagination.total} заявок
                </div>
                <OptimizedPagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={setPage}
                />

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Callback Time Picker Modal */}
      {callbackModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl ${isDark ? 'bg-[#1e2530] border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Время перезвона</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Когда перезвонить клиенту?</p>
              </div>
            </div>
            <input
              type="datetime-local"
              value={callbackModal.value}
              onChange={(e) => setCallbackModal({ ...callbackModal, value: e.target.value })}
              className={`w-full mb-4 ${dateFieldClass}`}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setCallbackModal(null)}
                className={isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              >
                Отмена
              </Button>
              <Button
                onClick={handleConfirmCallback}
                disabled={updateStatusMutation.isPending || !callbackModal.value}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Поставить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      <CreateOrderFromSiteModal
        open={isCreateOrderModalOpen}
        onOpenChange={setIsCreateOrderModalOpen}
        siteOrder={selectedSiteOrder}
        onOrderCreated={() => {
          setIsCreateOrderModalOpen(false);
          setSelectedSiteOrder(null);
          queryClient.invalidateQueries({ queryKey: ['site-orders'] });
        }}
      />
    </DashboardLayout>
  );
}
