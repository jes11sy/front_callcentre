import { useCallback } from 'react';
import { notifications } from '@/components/ui/notifications';
import { ordersService } from '@/services';
import type { Order } from '@/types/orders';
import { notifyApiError } from '@/lib/error-handling';

type UseOpenOrderByIdParams = {
  setSelectedOrder: (order: Order | null) => void;
  setIsViewModalOpen: (isOpen: boolean) => void;
  loadOrderCalls: (callIds: string) => Promise<void>;
  clearOrderCalls: () => void;
};

export function useOpenOrderById({
  setSelectedOrder,
  setIsViewModalOpen,
  loadOrderCalls,
  clearOrderCalls,
}: UseOpenOrderByIdParams) {
  return useCallback(async (orderId: number) => {
    try {
      const order = await ordersService.getOrderById(orderId);
      if (order && order.id) {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
        if (order.callId) {
          await loadOrderCalls(order.callId);
        } else {
          clearOrderCalls();
        }
        return;
      }
      notifications.error('Заказ не найден');
    } catch (error) {
      notifyApiError(error, 'Не удалось загрузить заказ', 'useOpenOrderById');
    }
  }, [clearOrderCalls, loadOrderCalls, setIsViewModalOpen, setSelectedOrder]);
}

