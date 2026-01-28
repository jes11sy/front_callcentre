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

export const useGroupedCalls = () => {
  // States
  const [groupedCalls, setGroupedCalls] = useState<Record<string, Call[]>>({});
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalGroups: 0,
    missedCalls: 0,
    answeredCalls: 0,
    todayCalls: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalGroups: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [newCallsCount, setNewCallsCount] = useState(0);
  const [lastParams, setLastParams] = useState<string>('');
  
  const previousTotalRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  // Fetch grouped calls
  const fetchGroupedCalls = useCallback(async (params: URLSearchParams) => {
    const paramsString = params.toString();
    
    // Предотвращаем повторные запросы с одинаковыми параметрами
    if (lastParams === paramsString && Object.keys(groupedCalls).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setLastParams(paramsString);

      const response = await authApi.get(`/calls/grouped?${paramsString}`);
      const data: GroupedCallsResponse = response.data;

      if (data.success) {
        const newGroupedCalls = data.data.groupedCalls;
        const newStats = data.data.stats;
        const newPagination = data.data.pagination;
        
        // Подсчёт новых звонков
        if (!isFirstLoadRef.current && newStats.totalCalls > previousTotalRef.current) {
          const newCallsDiff = newStats.totalCalls - previousTotalRef.current;
          setNewCallsCount(prev => prev + newCallsDiff);
        }
        
        previousTotalRef.current = newStats.totalCalls;
        isFirstLoadRef.current = false;
        
        setGroupedCalls(newGroupedCalls);
        setStats(newStats);
        setPagination(newPagination);
        
        // Также сохраняем плоский список для совместимости
        const flatCalls = Object.values(newGroupedCalls).flat();
        setCalls(flatCalls);
      } else {
        throw new Error('Ошибка при получении данных');
      }
    } catch (err: unknown) {
      if ((err as Error)?.message === 'SESSION_EXPIRED' || (err as any)?.isSessionExpired) {
        return;
      }
      
      console.error('Error fetching grouped calls:', err);
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при загрузке звонков');
      notifications.error('Ошибка при загрузке звонков');
    } finally {
      setLoading(false);
    }
  }, [lastParams, groupedCalls]);

  const resetNewCallsCount = useCallback(() => {
    setNewCallsCount(0);
  }, []);

  // Callbacks для socket events
  const handleNewCall = useCallback((call: Call) => {
    setGroupedCalls(prev => {
      const phone = call.phoneClient;
      const newGrouped = { ...prev };
      if (newGrouped[phone]) {
        newGrouped[phone] = [call, ...newGrouped[phone]];
      } else {
        // Добавляем новую группу в начало
        newGrouped[phone] = [call];
      }
      return newGrouped;
    });
    setCalls(prev => [call, ...prev]);
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
    setCalls(prev => prev.map(c => c.id === call.id ? { ...c, ...call } : c));
  }, []);

  const handleEndedCall = useCallback((call: Call) => {
    handleUpdatedCall(call);
  }, [handleUpdatedCall]);

  return {
    // Data
    groupedCalls,
    calls,
    stats,
    pagination,
    loading,
    error,
    newCallsCount,
    
    // Computed (для совместимости)
    totalCalls: stats.totalCalls,
    totalPages: pagination.totalPages,
    totalGroups: stats.totalGroups,
    
    // Functions
    fetchGroupedCalls,
    resetNewCallsCount,
    handleNewCall,
    handleUpdatedCall,
    handleEndedCall,
  };
};
