'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import api from '@/lib/api';
import { 
  Globe, 
  Loader2, 
  AlertCircle, 
  Plus,
  Phone,
  User,
  MapPin,
  MessageSquare,
  Clock,
  AlarmClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CreateOrderFromSiteModal from '@/components/site-orders/CreateOrderFromSiteModal';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

interface SiteOrder {
  id: number;
  city: { id: number; name: string } | null;
  site: string;
  clientName: string;
  phone: string;
  status: string;
  comment: string | null;
  commentOperator: string | null;
  callbackAt: string | null;
  createdAt: string;
  orderId: number | null;
}

interface SiteOrdersResponse {
  data: SiteOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
      return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30';
    case 'Отказ':
      return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30';
    default:
      return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-500/30';
  }
};

export default function SiteOrdersPage() {
  const { user } = useAuthStore();
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

  // Fetch site orders
  const { data, isLoading, error } = useQuery<SiteOrdersResponse>({
    queryKey: ['site-orders', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/site-orders?${params.toString()}`);
      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, callbackAt }: { id: number; status: string; callbackAt?: string }) => {
      const response = await api.patch(`/site-orders/${id}/status`, { status, callbackAt });
      return response.data;
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
      const response = await api.patch(`/site-orders/${id}`, { commentOperator });
      return response.data;
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
        <div className="flex items-center justify-center min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FEC004]" />
            <p className="text-gray-500 dark:text-gray-400">Загрузка заявок...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">Ошибка при загрузке заявок</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-4 px-4 min-h-screen bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
        <div className="w-full">
          {/* Filters */}
          <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Поиск по имени, телефону, сайту..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004]"
                />
              </div>
              <div className="w-[200px]">
                <Select value={statusFilter || ''} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                    <SelectItem value="all" className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">Все статусы</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-gray-700">
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
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a] transition-colors"
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
                              className={`w-[150px] h-8 text-xs border ${getStatusColor(order.status)} bg-transparent [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem 
                                  key={status} 
                                  value={status} 
                                  className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
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
                                className="h-8 text-sm bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveComment(order.id);
                                  if (e.key === 'Escape') setEditingComment(null);
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveComment(order.id)}
                                className="h-8 bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
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
                              className="h-8 bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-semibold"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Заказ
                            </Button>
                          ) : (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Заказ #{order.orderId}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Заявки не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Показано {data.data.length} из {data.pagination.total} заявок
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004]"
                  >
                    Назад
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004]"
                  >
                    Далее
                  </Button>
                </div>
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
              className={`w-full h-10 px-3 rounded-lg border text-sm mb-4 focus:outline-none focus:border-purple-400 ${
                isDark
                  ? 'bg-[#252d3a] border-gray-600 text-gray-100 [color-scheme:dark]'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
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
