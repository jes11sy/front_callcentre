import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Order, OrdersResponse, OrderFilters, Call } from '@/types/orders';
import { notifications } from '@/components/ui/notifications';
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance

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

  // 🍪 Получение списка заказов через axios
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

      const response = await api.get(`/orders?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Неверный формат ответа API');
    },
    enabled: !!user
  });

  // 🕐 Получение всех активных заказов на сегодня для временной шкалы
  const { data: todayOrdersData } = useQuery<OrdersResponse>({
    queryKey: ['orders-today', user?.id, user?.role],
    queryFn: async () => {
      if (!user) {
        throw new Error('Данные пользователя не загружены');
      }
      
      // Получаем сегодняшнюю дату в формате YYYY-MM-DD
      const today = new Date();
      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = dateFrom;
      
      const params = new URLSearchParams({
        page: '1',
        limit: '300', // Все заказы на сегодня
        dateType: 'meeting',
        dateFrom,
        dateTo,
      });

      const response = await api.get(`/orders?${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Неверный формат ответа API');
    },
    enabled: !!user,
    staleTime: 30000, // Кэшируем на 30 секунд
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

  // 🍪 Обновление статуса заказа через axios
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.success('Статус заказа обновлен');
    },
    onError: () => {
      notifications.error('Ошибка при обновлении статуса');
    }
  });

  // 🍪 Обновление заказа через axios
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, orderData }: { id: number; orderData: Partial<Order> }) => {
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
      
      const response = await api.put(`/orders/${id}`, filteredData);
      return response.data;
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

  // 🍪 Загрузка записей звонков через axios
  const loadOrderCalls = useCallback(async (callIds: string) => {
    if (!callIds) return;
    
    setLoadingCalls(true);
    try {
      const callIdArray = callIds.split(',');
      const calls = await Promise.all(
        callIdArray.map(async (callId) => {
          try {
            const response = await api.get(`/calls/${callId}`);
            return response.data.data;
          } catch {
            return null;
          }
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

  // Открыть заказ по ID (для ссылок типа /orders?orderId=123)
  const openOrderById = useCallback(async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      // ✅ FIX: API возвращает { success: true, data: order }
      const order = response.data.data || response.data;
      if (order && order.id) {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
        if (order.callId) {
          loadOrderCalls(order.callId);
        } else {
          setOrderCalls([]);
        }
      } else {
        notifications.error('Заказ не найден');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      notifications.error('Не удалось загрузить заказ');
    }
  }, [loadOrderCalls]);

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
    todayOrders: todayOrdersData?.orders || [],
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
    openOrderById,
    
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
