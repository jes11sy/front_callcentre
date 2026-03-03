'use client';

import { useState, useCallback, useRef } from 'react';
import { Call } from '@/types/telephony';
import authApi from '@/lib/auth';
import { notifications } from '@/components/ui/notifications';

interface GroupedCallsResponse {
  success: boolean;
  data: {
    groupedCalls: Record<string, Call[]>;
    stats: {
      totalCalls: number;
      totalGroups: number;
      missedCalls: number;
      answeredCalls: number;
      todayCalls: number;
    };
    pagination: {
      page: number;
      limit: number;
      totalGroups: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export const useCallsData = () => {
  // States
  const [calls, setCalls] = useState<Call[]>([]);
  const [groupedCalls, setGroupedCalls] = useState<Record<string, Call[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalGroups: 0,
    missedCalls: 0,
    answeredCalls: 0,
    todayCalls: 0,
  });
  const [newCallsCount, setNewCallsCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [answeredCallForAppeal, setAnsweredCallForAppeal] = useState<Call | null>(null);
  
  const lastParamsRef = useRef<string>('');
  const hasDataRef = useRef<boolean>(false);
  const previousTotalRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  const fetchCalls = useCallback(async (params: URLSearchParams) => {
    const paramsString = params.toString();
    
    if (lastParamsRef.current === paramsString && hasDataRef.current) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      lastParamsRef.current = paramsString;

      const response = await authApi.get(`/calls/grouped?${paramsString}`);
      const data: GroupedCallsResponse = response.data;

      if (data.success) {
        const newGroupedCalls = data.data.groupedCalls;
        const newStats = data.data.stats;
        const pagination = data.data.pagination;
        
        if (!isFirstLoadRef.current && newStats.totalCalls > previousTotalRef.current) {
          const newCallsDiff = newStats.totalCalls - previousTotalRef.current;
          setNewCallsCount(prev => prev + newCallsDiff);
        }
        
        previousTotalRef.current = newStats.totalCalls;
        isFirstLoadRef.current = false;
        hasDataRef.current = Object.keys(newGroupedCalls).length > 0;
        
        setGroupedCalls(newGroupedCalls);
        setStats(newStats);
        setTotalCalls(newStats.totalCalls);
        setTotalGroups(newStats.totalGroups);
        setTotalPages(pagination.totalPages);
        
        const flatCalls = Object.values(newGroupedCalls).flat();
        setCalls(flatCalls);
      } else {
        throw new Error('Ошибка при получении данных');
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.message === 'SESSION_EXPIRED' || (err as Error & { isSessionExpired?: boolean }).isSessionExpired)) {
        return;
      }
      
      console.error('Error fetching calls:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при загрузке звонков');
      notifications.error('Ошибка при загрузке звонков');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetNewCallsCount = useCallback(() => {
    setNewCallsCount(0);
    // ✅ FIX: При сбросе счётчика также обновляем baseline для корректного подсчёта
    // previousTotalRef остаётся актуальным, сбрасываем только UI счётчик
  }, []);

  // Callbacks для socket events
  const handleNewCall = useCallback((call: Call) => {
    // Обновляем groupedCalls
    setGroupedCalls(prev => {
      const phone = call.phoneClient;
      const newGrouped = { [phone]: [call], ...prev }; // Новая группа в начало
      if (prev[phone]) {
        newGrouped[phone] = [call, ...prev[phone]];
      }
      return newGrouped;
    });
    setCalls(prevCalls => [call, ...prevCalls]);
    setTotalCalls(prev => prev + 1);
    setStats(prev => ({
      ...prev,
      totalCalls: prev.totalCalls + 1,
      missedCalls: call.status === 'missed' ? prev.missedCalls + 1 : prev.missedCalls,
      answeredCalls: call.status === 'answered' ? prev.answeredCalls + 1 : prev.answeredCalls,
    }));
    setNewCallsCount(prev => prev + 1);
  }, []);

  const handleUpdatedCall = useCallback((call: Call) => {
    setGroupedCalls(prev => {
      const newGrouped = { ...prev };
      for (const phone in newGrouped) {
        newGrouped[phone] = newGrouped[phone].map(c => 
          c.id === call.id ? { ...c, ...call } : c
        );
      }
      return newGrouped;
    });
    setCalls(prevCalls => 
      prevCalls.map(c => 
        c.id === call.id ? { ...c, ...call } : c
      )
    );

    if (call.status === 'answered' && call.callDirection === 'inbound' && !call.appealId) {
      setAnsweredCallForAppeal(call);
    }
  }, []);

  const handleEndedCall = useCallback((call: Call) => {
    handleUpdatedCall(call);
  }, [handleUpdatedCall]);

  const clearAnsweredCallForAppeal = useCallback(() => {
    setAnsweredCallForAppeal(null);
  }, []);

  return {
    calls,
    groupedCalls,
    loading,
    error,
    totalCalls,
    totalPages,
    totalGroups,
    stats,
    newCallsCount,
    socketConnected,
    answeredCallForAppeal,
    fetchCalls,
    resetNewCallsCount,
    clearAnsweredCallForAppeal,
    handleNewCall,
    handleUpdatedCall,
    handleEndedCall
  };
};
