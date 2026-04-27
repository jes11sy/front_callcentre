import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@/components/ui/notifications';
import { ordersService } from '@/services';
import type { Order } from '@/types/orders';

type UseOrderMutationsParams = {
  onOrderUpdated?: () => void;
};

export function useOrderMutations({ onOrderUpdated }: UseOrderMutationsParams = {}) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return ordersService.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.success('Статус заказа обновлен');
    },
    onError: () => {
      notifications.error('Ошибка при обновлении статуса');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, orderData }: { id: number; orderData: Partial<Order> }) => {
      return ordersService.updateOrder(id, orderData);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.success(result.message || 'Заказ успешно обновлен');
      onOrderUpdated?.();
    },
    onError: () => {
      notifications.error('Ошибка при обновлении заказа');
    },
  });

  const handleStatusChange = useCallback((orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  }, [updateStatusMutation]);

  const handleSaveOrder = useCallback((selectedOrder: Order | null) => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      orderData: selectedOrder,
    });
  }, [updateOrderMutation]);

  return {
    updateStatusMutation,
    updateOrderMutation,
    handleStatusChange,
    handleSaveOrder,
  };
}

