'use client';

import { useState, useCallback } from 'react';
import { Call } from '@/types/telephony';
import { toast } from 'sonner';
import { notifications } from '@/components/ui/notifications';
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance
import { logger } from '@/lib/logger';

export const useCallsActions = () => {
  // States
  const [playingCall, setPlayingCall] = useState<number | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [selectedCallForOrder, setSelectedCallForOrder] = useState<Call | null>(null);
  const [selectedCallGroup, setSelectedCallGroup] = useState<Call[]>([]);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedCallForHistory, setSelectedCallForHistory] = useState<Call | null>(null);
  const [orderHistory, setOrderHistory] = useState<unknown[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

  // Мемоизированные функции
  // 🍪 Загрузка истории заказов через axios
  const loadOrderHistory = useCallback(async (call: Call) => {
    try {
      setOrderHistoryLoading(true);
      setSelectedCallForHistory(call);
      
      const response = await api.get(`/orders?search=${encodeURIComponent(call.phoneClient)}`);
      // API может возвращать data как массив напрямую или как объект с orders
      const orders = Array.isArray(response.data.data) 
        ? response.data.data 
        : (response.data.data?.orders || []);
      setOrderHistory(orders);
      setShowOrderHistoryModal(true);
    } catch (error) {
      console.error('Error loading order history:', error);
      notifications.error('Ошибка при загрузке истории заказов');
    } finally {
      setOrderHistoryLoading(false);
    }
  }, []);

  // 🍪 Загрузка записи звонка через axios
  const loadRecording = useCallback(async (call: Call) => {
    if (!call.recordingPath) {
      toast.error('Запись не найдена');
      return;
    }

    try {
      setPlayingCall(call.id);
      
      // axios автоматически определяет JSON response
      const response = await api.get(`/recordings/call/${call.id}/download`, {
        responseType: 'json', // Пробуем JSON сначала
      });
      
      let audioUrl: string;
      
      if (response.data.success && response.data.url) {
        audioUrl = response.data.url;
      } else {
        throw new Error(response.data.message || 'Не удалось получить URL записи');
      }
      
      setCurrentAudioUrl(audioUrl);
      
    } catch (error: unknown) {
      console.error('Error loading recording:', error);
      toast.error('Ошибка загрузки записи: ' + (error as { message?: string }).message);
      setPlayingCall(null);
      setCurrentAudioUrl(null);
    }
  }, []);

  const closePlayer = useCallback(() => {
    setPlayingCall(null);
    setCurrentAudioUrl(null);
  }, []);

  // 🍪 Скачивание записи звонка через axios
  const downloadRecording = useCallback(async (call: Call) => {
    if (!call.recordingPath) {
      notifications.error('Запись звонка недоступна');
      return;
    }

    try {
      const response = await api.get(`/recordings/call/${call.id}/download`);

      // Получаем JSON с URL
      const data = response.data;
      if (data.success && data.url) {
        // Открываем S3 URL напрямую для скачивания
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `call_${call.id}_recording.mp3`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        notifications.success('Запись звонка загружена');
      } else {
        throw new Error(data.message || 'Не удалось получить URL записи');
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      notifications.error('Ошибка при загрузке записи');
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
    playingCall,
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
