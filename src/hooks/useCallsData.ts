'use client';

import { useState, useCallback, useRef } from 'react';
import { Call, CallsResponse } from '@/types/telephony';
import authApi from '@/lib/auth';
import { notifications } from '@/components/ui/notifications';

export const useCallsData = () => {
  // States
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [newCallsCount, setNewCallsCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastParams, setLastParams] = useState<string>('');
  
  // ✅ FIX: Используем ref для хранения предыдущего total (pagination.total),
  // а не prevCalls.length (количество на текущей странице)
  const previousTotalRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

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
        
        // ✅ FIX: Правильный подсчёт новых звонков
        // Сравниваем pagination.total (общее количество) с предыдущим pagination.total
        if (!isFirstLoadRef.current && currentCallCount > previousTotalRef.current) {
          const newCallsDiff = currentCallCount - previousTotalRef.current;
          setNewCallsCount(prev => prev + newCallsDiff);
        }
        
        // Обновляем ref для следующего сравнения
        previousTotalRef.current = currentCallCount;
        isFirstLoadRef.current = false;
        
        setCalls(newCalls);
        setTotalCalls(currentCallCount);
        setTotalPages(currentTotalPages);
      } else {
        throw new Error('Ошибка при получении данных');
      }
    } catch (err: unknown) {
      // Игнорируем ошибки истекшей сессии (редирект уже произошел)
      if ((err as Error)?.message === 'SESSION_EXPIRED' || (err as any)?.isSessionExpired) {
        return;
      }
      
      console.error('Error fetching calls:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при загрузке звонков');
      notifications.error('Ошибка при загрузке звонков');
    } finally {
      setLoading(false);
    }
  }, [lastParams, calls.length]); // Добавляем необходимые зависимости

  const resetNewCallsCount = useCallback(() => {
    setNewCallsCount(0);
    // ✅ FIX: При сбросе счётчика также обновляем baseline для корректного подсчёта
    // previousTotalRef остаётся актуальным, сбрасываем только UI счётчик
  }, []);

  // Callbacks для socket events
  const handleNewCall = useCallback((call: Call) => {
    setCalls(prevCalls => [call, ...prevCalls]);
    setTotalCalls(prev => prev + 1);
    setNewCallsCount(prev => prev + 1);
  }, []);

  const handleUpdatedCall = useCallback((call: Call) => {
    setCalls(prevCalls => 
      prevCalls.map(c => 
        c.id === call.id ? { ...c, ...call } : c
      )
    );
  }, []);

  const handleEndedCall = useCallback((call: Call) => {
    setCalls(prevCalls => 
      prevCalls.map(c => 
        c.id === call.id ? { ...c, ...call } : c
      )
    );
  }, []);

  return {
    calls,
    loading,
    error,
    totalCalls,
    totalPages,
    newCallsCount,
    socketConnected,
    fetchCalls,
    resetNewCallsCount,
    handleNewCall,
    handleUpdatedCall,
    handleEndedCall
  };
};
