'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { 
  Globe, 
  Loader2, 
  AlertCircle, 
  Plus,
  Phone,
  User,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CreateOrderFromSiteModal from '@/components/site-orders/CreateOrderFromSiteModal';

interface SiteOrder {
  id: number;
  city: string;
  site: string;
  clientName: string;
  phone: string;
  status: string;
  comment: string | null;
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

const STATUS_OPTIONS = ['Создан', 'Не отвечает', 'Отказ', 'Заказ создан'] as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Создан':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Не отвечает':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Отказ':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Заказ создан':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function SiteOrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedSiteOrder, setSelectedSiteOrder] = useState<SiteOrder | null>(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: number; value: string } | null>(null);

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
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.patch(`/site-orders/${id}/status`, { status });
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

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: number; comment: string }) => {
      const response = await api.patch(`/site-orders/${id}`, { comment });
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
    updateStatusMutation.mutate({ id, status });
  };

  const handleCreateOrder = (siteOrder: SiteOrder) => {
    setSelectedSiteOrder(siteOrder);
    setIsCreateOrderModalOpen(true);
  };

  const handleSaveComment = (id: number) => {
    if (editingComment && editingComment.id === id) {
      updateCommentMutation.mutate({ id, comment: editingComment.value });
    }
  };

  if (isLoading && !data) {
    return (
      <DashboardLayout variant={user?.role === 'admin' ? 'admin' : 'operator'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFD700]" />
            <p className="text-gray-400">Загрузка заявок...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout variant={user?.role === 'admin' ? 'admin' : 'operator'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">Ошибка при загрузке заявок</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant={user?.role === 'admin' ? 'admin' : 'operator'}>
      <div className="w-full py-4 px-4 bg-[#0f0f23] min-h-screen">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-[#FFD700]" />
              <h1 className="text-2xl font-bold text-[#F8F7F9]">Заявки Сайт</h1>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#17212b] border border-[#FFD700]/30 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Поиск по имени, телефону, сайту..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/30 text-white">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                    <SelectItem value="all" className="text-white hover:bg-[#FFD700]/10">Все статусы</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-white hover:bg-[#FFD700]/10">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#17212b] border border-[#FFD700]/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0f0f23] border-b border-[#FFD700]/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Город
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Сайт
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Имя
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Телефон
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">Статус</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Комментарий
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#FFD700]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((order) => (
                      <tr 
                        key={order.id} 
                        className="border-b border-[#FFD700]/10 hover:bg-[#FFD700]/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-white">{order.city}</td>
                        <td className="px-4 py-3 text-sm text-white">{order.site}</td>
                        <td className="px-4 py-3 text-sm text-white">{order.clientName}</td>
                        <td className="px-4 py-3 text-sm text-white font-mono">{order.phone}</td>
                        <td className="px-4 py-3">
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={order.status === 'Заказ создан'}
                          >
                            <SelectTrigger 
                              className={`w-[150px] h-8 text-xs border ${getStatusColor(order.status)} bg-transparent`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0f23] border-[#FFD700]/30">
                              {STATUS_OPTIONS.filter(s => s !== 'Заказ создан').map((status) => (
                                <SelectItem 
                                  key={status} 
                                  value={status} 
                                  className="text-white hover:bg-[#FFD700]/10"
                                >
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {editingComment?.id === order.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingComment.value}
                                onChange={(e) => setEditingComment({ ...editingComment, value: e.target.value })}
                                className="h-8 text-sm bg-[#0f0f23] border-[#FFD700]/30 text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveComment(order.id);
                                  if (e.key === 'Escape') setEditingComment(null);
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveComment(order.id)}
                                className="h-8 bg-[#FFD700] text-[#0f0f23] hover:bg-[#FFC700]"
                              >
                                ОК
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-sm text-gray-400 cursor-pointer hover:text-white min-h-[32px] flex items-center"
                              onClick={() => setEditingComment({ id: order.id, value: order.comment || '' })}
                            >
                              {order.comment || <span className="text-gray-600 italic">Добавить комментарий...</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.status !== 'Заказ создан' ? (
                            <Button
                              size="sm"
                              onClick={() => handleCreateOrder(order)}
                              className="h-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Заказ
                            </Button>
                          ) : (
                            <span className="text-sm text-green-400">
                              Заказ #{order.orderId}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        Заявки не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#FFD700]/30">
                <div className="text-sm text-gray-400">
                  Показано {data.data.length} из {data.pagination.total} заявок
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                  >
                    Назад
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-400">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                  >
                    Далее
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
