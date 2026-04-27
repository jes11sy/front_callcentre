import { useCallback, useState } from 'react';
import type { Order } from '@/types/orders';

type UseOrderModalStateParams = {
  loadOrderCalls: (callIds: string) => Promise<void>;
  clearOrderCalls: () => void;
};

export function useOrderModalState({ loadOrderCalls, clearOrderCalls }: UseOrderModalStateParams) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
    if (order.callId) {
      void loadOrderCalls(order.callId);
    } else {
      clearOrderCalls();
    }
  }, [clearOrderCalls, loadOrderCalls]);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
  }, []);

  const handleEditOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  }, []);

  return {
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
  };
}

