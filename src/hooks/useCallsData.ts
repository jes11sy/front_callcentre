'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Call, CallsResponse } from '@/types/telephony';
import authApi from '@/lib/auth';
import { notifications } from '@/components/ui/notifications';

export const useCallsData = () => {
  const socket = useSocket();
  
  // States
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastCallCount, setLastCallCount] = useState(0);
  const [newCallsCount, setNewCallsCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastParams, setLastParams] = useState<string>('');

  // Мемоизированные функции
  const fetchCalls = useCallback(async (params: URLSearchParams) => {
    const paramsString = params.toString();
    
    // Предотвращаем повторные запросы с одинаковыми параметрами
    if (lastParams === paramsString && calls.length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setLastParams(paramsString);

      const response = await authApi.get(`/calls?${paramsString}`);
      const data: CallsResponse = response.data;

      if (data.success) {
        const newCalls = data.data.calls;
        const currentCallCount = data.data.pagination.total;
        const currentTotalPages = data.data.pagination.totalPages;
        
        // Check for new calls
        setCalls(prevCalls => {
          // Проверяем новые звонки только если это не первая загрузка
          if (prevCalls.length > 0 && currentCallCount > prevCalls.length) {
            const newCallsCount = currentCallCount - prevCalls.length;
            setNewCallsCount(prev => prev + newCallsCount);
          }
          return newCalls;
        });
        
        setTotalCalls(currentCallCount);
        setTotalPages(currentTotalPages);
        setLastCallCount(currentCallCount);
      } else {
        throw new Error('Ошибка при получении данных');
      }
    } catch (err: unknown) {
      console.error('Error fetching calls:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при загрузке звонков');
      notifications.error('Ошибка при загрузке звонков');
    } finally {
      setLoading(false);
    }
  }, [lastParams, calls.length]); // Добавляем необходимые зависимости

  const resetNewCallsCount = useCallback(() => {
    setNewCallsCount(0);
  }, []);

  // Socket setup
  useEffect(() => {
    if (!socket) {
      setSocketConnected(false);
      return;
    }
    setSocketConnected(true);

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('mango-new-call', (data: { call: Call }) => {
      console.log('📞 New call from Mango webhook:', data);
      
      setCalls(prevCalls => [data.call, ...prevCalls]);
      setTotalCalls(prev => prev + 1);
      setNewCallsCount(prev => prev + 1);
      
      notifications.info('Новый звонок получен');
    });

    socket.on('mango-call-updated', (data: { callId: number; call: Call }) => {
      console.log('📞 Call updated from Mango webhook:', data);
      
      setCalls(prevCalls => 
        prevCalls.map(call => 
          call.id === data.callId ? data.call : call
        )
      );
    });

    return () => {
      socket.off('mango-new-call');
      socket.off('mango-call-updated');
    };
  }, [socket]);

  return {
    calls,
    loading,
    error,
    totalCalls,
    totalPages,
    newCallsCount,
    socketConnected,
    fetchCalls,
    resetNewCallsCount
  };
};
