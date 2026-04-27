import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOpenOrderById } from './useOpenOrderById';
import { useOrderCalls } from './useOrderCalls';
import { useOrderModalState } from './useOrderModalState';
import { useOrderMutations } from './useOrderMutations';
import { useOrdersFiltersPagination } from './useOrdersFiltersPagination';
import { useOrdersListQuery } from './useOrdersListQuery';
import { useOrdersTimelineQuery } from './useOrdersTimelineQuery';

export const useOrders = () => {
  const { user } = useAuthStore();
  const [timelineDate, setTimelineDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const {
    filters,
    page,
    limit,
    queryParams,
    setPage,
    setLimit,
    updateFilter,
    resetFilters,
  } = useOrdersFiltersPagination();

  const { data: ordersData, isLoading, error } = useOrdersListQuery(queryParams, user);
  const { data: timelineOrdersData } = useOrdersTimelineQuery(timelineDate, user);

  const {
    orderCalls,
    loadingCalls,
    loadOrderCalls,
    setOrderCalls,
  } = useOrderCalls();

  const {
    selectedOrder,
    isEditModalOpen,
    isViewModalOpen,
    isCreateModalOpen,
    setSelectedOrder,
    setIsEditModalOpen,
    setIsViewModalOpen,
    setIsCreateModalOpen,
    handleViewOrder,
    handleCloseViewModal,
    handleEditOrder,
  } = useOrderModalState({
    loadOrderCalls,
    clearOrderCalls: () => setOrderCalls([]),
  });

  const {
    updateStatusMutation,
    updateOrderMutation,
    handleStatusChange,
    handleSaveOrder,
  } = useOrderMutations({
    onOrderUpdated: () => setIsEditModalOpen(false),
  });

  const openOrderById = useOpenOrderById({
    setSelectedOrder,
    setIsViewModalOpen,
    loadOrderCalls,
    clearOrderCalls: () => setOrderCalls([]),
  });

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
    timelineOrders: timelineOrdersData?.orders || [],
    timelineDate,
    isLoading,
    error,
    user,
    
    // Мутации
    updateStatusMutation,
    updateOrderMutation,
    
    // Обработчики
    handleStatusChange,
    handleSaveOrder: () => handleSaveOrder(selectedOrder),
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
    setOrderCalls,
    setTimelineDate
  };
};
