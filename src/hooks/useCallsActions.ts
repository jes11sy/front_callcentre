'use client';

import { useState, useCallback } from 'react';
import { Call } from '@/types/telephony';
import { toast } from 'sonner';
import { notifications } from '@/components/ui/notifications';
import { logger } from '@/lib/logger';
import { ordersService } from '@/services';
import { useCallRecordingPlayback } from './useCallRecordingPlayback';
import { notifyApiError } from '@/lib/error-handling';

export const useCallsActions = () => {
  // States
  const [selectedCallForOrder, setSelectedCallForOrder] = useState<Call | null>(null);
  const [selectedCallGroup, setSelectedCallGroup] = useState<Call[]>([]);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedCallForHistory, setSelectedCallForHistory] = useState<Call | null>(null);
  const [orderHistory, setOrderHistory] = useState<unknown[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

  const {
    playingCall: activeCall,
    currentAudioUrl,
    loadRecording,
    closePlayer,
    downloadRecording,
  } = useCallRecordingPlayback<Call>({
    hasRecording: (call) => Boolean(call.recordingPath),
    onMissingRecording: () => {
      toast.error('Запись не найдена');
    },
    onLoadError: (error) => {
      notifyApiError(error, 'Ошибка загрузки записи', 'useCallsActions.loadRecording');
    },
    onDownloadSuccess: () => {
      notifications.success('Запись звонка загружена');
    },
    onDownloadError: () => {
      notifications.error('Ошибка при загрузке записи');
    },
  });

  // Мемоизированные функции
  // 🍪 Загрузка истории заказов через axios
  const loadOrderHistory = useCallback(async (call: Call) => {
    try {
      setOrderHistoryLoading(true);
      setSelectedCallForHistory(call);

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        search: call.phoneClient,
      });
      const response = await ordersService.getOrders(params);
      const orders = response.orders || [];
      setOrderHistory(orders);
      setShowOrderHistoryModal(true);
    } catch (error) {
      notifyApiError(error, 'Ошибка при загрузке истории заказов', 'useCallsActions.loadOrderHistory');
    } finally {
      setOrderHistoryLoading(false);
    }
  }, []);

  const createOrderFromCall = useCallback((call: Call, groupCalls?: Call[]) => {
    setSelectedCallForOrder(call);
    setSelectedCallGroup(groupCalls || [call]);
    setShowCreateOrderModal(true);
  }, []);

  const handleOrderCreated = useCallback((order: { id?: string | number }) => {
    // Уведомление уже показывается в компоненте CreateOrderModal
    logger.log('Order created:', order);
  }, []);

  return {
    // States
    playingCall: activeCall?.id ?? null,
    currentAudioUrl,
    selectedCallForOrder,
    selectedCallGroup,
    showCreateOrderModal,
    showOrderHistoryModal,
    selectedCallForHistory,
    orderHistory,
    orderHistoryLoading,
    
    // Functions
    setShowCreateOrderModal,
    setShowOrderHistoryModal,
    loadOrderHistory,
    loadRecording,
    closePlayer,
    downloadRecording,
    createOrderFromCall,
    handleOrderCreated
  };
};
