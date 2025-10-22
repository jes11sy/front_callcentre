'use client';

import { useState, useCallback } from 'react';
import { Call } from '@/types/telephony';
import { toast } from 'sonner';
import { notifications } from '@/components/ui/notifications';
import { tokenStorage } from '@/lib/secure-storage';

export const useCallsActions = () => {
  // States
  const [playingCall, setPlayingCall] = useState<number | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [selectedCallForOrder, setSelectedCallForOrder] = useState<Call | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedCallForHistory, setSelectedCallForHistory] = useState<Call | null>(null);
  const [orderHistory, setOrderHistory] = useState<unknown[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

  // Мемоизированные функции
  const loadOrderHistory = useCallback(async (call: Call) => {
    try {
      setOrderHistoryLoading(true);
      setSelectedCallForHistory(call);
      
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.test-shem.ru/api/v1'}/orders?search=${encodeURIComponent(call.phoneClient)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке истории заказов');
      }

      const data = await response.json();
      setOrderHistory(data.data?.orders || []);
      setShowOrderHistoryModal(true);
    } catch (error) {
      console.error('Error loading order history:', error);
      notifications.error('Ошибка при загрузке истории заказов');
    } finally {
      setOrderHistoryLoading(false);
    }
  }, []);

  const loadRecording = useCallback(async (call: Call) => {
    if (!call.recordingPath) {
      toast.error('Запись не найдена');
      return;
    }

    try {
      setPlayingCall(call.id);
      
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recordings/call/${call.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let audioUrl: string;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.url) {
          audioUrl = data.url;
        } else {
          throw new Error(data.message || 'Не удалось получить URL записи');
        }
      } else {
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
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

  const downloadRecording = useCallback(async (call: Call) => {
    if (!call.recordingPath) {
      notifications.error('Запись звонка недоступна');
      return;
    }

    try {
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`/api/recordings/call/${call.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке записи');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call_${call.id}_recording.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      notifications.success('Запись звонка загружена');
    } catch (error) {
      console.error('Error downloading recording:', error);
      notifications.error('Ошибка при загрузке записи');
    }
  }, []);

  const createOrderFromCall = useCallback((call: Call) => {
    setSelectedCallForOrder(call);
    setShowCreateOrderModal(true);
  }, []);

  const handleOrderCreated = useCallback((order: { id?: string | number }) => {
    notifications.success(`Заказ №${order.id} успешно создан!`);
  }, []);

  return {
    // States
    playingCall,
    currentAudioUrl,
    selectedCallForOrder,
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
