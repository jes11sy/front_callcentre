import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Order, OrdersResponse, OrderFilters, Call } from '@/types/orders';
import { notifications } from '@/components/ui/notifications';
import { tokenStorage } from '@/lib/secure-storage';

export const useOrders = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Состояние фильтров
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    city: '',
    master: '',
    closingDate: ''
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderCalls, setOrderCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  // Редирект админов на админскую страницу заказов
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin/orders');
      return;
    }
  }, [user, router]);

  // Мемоизированные параметры запроса для оптимизации
  const queryParams = useMemo(() => ({
    page,
    limit,
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    city: filters.city || undefined,
    master: filters.master || undefined,
    closingDate: filters.closingDate || undefined,
  }), [page, limit, filters]);

  // Получение списка заказов
  const { data: ordersData, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['orders', queryParams, user?.id, user?.role],
    queryFn: async () => {
      if (!user) {
        throw new Error('Данные пользователя не загружены');
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.city && { city: filters.city }),
        ...(filters.master && { master: filters.master }),
        ...(filters.closingDate && { closingDate: filters.closingDate }),
      });

      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1'}/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке заказов');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Неверный формат ответа API');
    },
    enabled: !!user
  });

  // Обработка параметра orderId из URL
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && ordersData?.orders) {
      const order = ordersData.orders.find(o => o.id === parseInt(orderId));
      if (order) {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
        // Очищаем URL параметр
        const url = new URL(window.location.href);
        url.searchParams.delete('orderId');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, ordersData?.orders]);

  // Обновление статуса заказа
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1'}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.success('Статус заказа обновлен');
    },
    onError: () => {
      notifications.error('Ошибка при обновлении статуса');
    }
  });

  // Обновление заказа
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, orderData }: { id: number; orderData: Partial<Order> }) => {
      const token = await tokenStorage.getAccessToken();
      
      // Фильтруем только разрешенные для обновления поля (согласно UpdateOrderDto)
      const allowedFields = [
        // Основные поля
        'rk', 'city', 'avitoName', 'phone', 'typeOrder', 'clientName', 'address',
        'dateMeeting', 'typeEquipment', 'problem', 'avitoChatId', 'callId', 'operatorNameId',
        // Статус и мастер
        'statusOrder', 'masterId',
        // Финансовые поля
        'result', 'expenditure', 'clean', 'masterChange', 'prepayment',
        // Документы
        'bsoDoc', 'expenditureDoc', 'cashReceiptDoc',
        // Даты
        'closingData', 'dateClosmod',
        // Дополнительные поля
        'comment', 'cashSubmissionStatus', 'cashSubmissionAmount'
      ];
      
      const filteredData: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in orderData) {
          filteredData[key] = orderData[key as keyof Order];
        }
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.lead-schem.ru/api/v1'}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filteredData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении заказа');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.success(data.message || 'Заказ успешно обновлен');
      setIsEditModalOpen(false);
    },
    onError: () => {
      notifications.error('Ошибка при обновлении заказа');
    }
  });

  // Загрузка записей звонков
  const loadOrderCalls = useCallback(async (callIds: string) => {
    if (!callIds) return;
    
    setLoadingCalls(true);
    try {
      const token = await tokenStorage.getAccessToken();
      const callIdArray = callIds.split(',');
      const calls = await Promise.all(
        callIdArray.map(async (callId) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/calls/${callId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            return result.data;
          }
          return null;
        })
      );
      setOrderCalls(calls.filter(call => call !== null && call.recordingPath));
    } catch (error) {
      console.error('Error loading calls:', error);
      setOrderCalls([]);
    } finally {
      setLoadingCalls(false);
    }
  }, []);

  // Обработчики
  const handleStatusChange = useCallback((orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  }, [updateStatusMutation]);

  const handleSaveOrder = useCallback(() => {
    if (selectedOrder) {
      updateOrderMutation.mutate({ 
        id: selectedOrder.id, 
        orderData: selectedOrder 
      });
    }
  }, [selectedOrder, updateOrderMutation]);

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
    if (order.callId) {
      loadOrderCalls(order.callId);
    } else {
      setOrderCalls([]);
    }
  }, [loadOrderCalls]);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
  }, []);

  const handleEditOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  }, []);

  const updateFilter = useCallback((key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Сбрасываем на первую страницу при изменении фильтров
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      city: '',
      master: '',
      closingDate: ''
    });
    setPage(1);
  }, []);

  return {
    // Состояние
    filters,
    page,
    limit,
    selectedOrder,
    isEditModalOpen,
    isViewModalOpen,
    isCreateModalOpen,
    orderCalls,
    loadingCalls,
    ordersData,
    isLoading,
    error,
    user,
    
    // Мутации
    updateStatusMutation,
    updateOrderMutation,
    
    // Обработчики
    handleStatusChange,
    handleSaveOrder,
    handleViewOrder,
    handleCloseViewModal,
    handleEditOrder,
    updateFilter,
    resetFilters,
    loadOrderCalls,
    
    // Сеттеры
    setPage,
    setLimit,
    setSelectedOrder,
    setIsEditModalOpen,
    setIsViewModalOpen,
    setIsCreateModalOpen,
    setOrderCalls
  };
};
