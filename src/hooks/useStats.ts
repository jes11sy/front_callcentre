'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api'; // 🍪 Используем настроенный axios instance

interface OperatorStats {
  operator: {
    id: number;
    name: string;
    cityId?: number;
    city?: { id: number; name: string };
  };
  period: {
    startDate: string;
    endDate: string;
  };
  calls: {
    total: number;
    accepted: number;
    missed: number;
    acceptanceRate: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
  };
  dailyStats: Array<{
    date: string;
    calls: number;
  }>;
  cityStats: Array<{
    cityId: number;
    cityName: string;
    calls: number;
  }>;
  rkStats: Array<{
    rkId: number;
    rkName: string;
    calls: number;
  }>;
}

export const useStats = (startDate: string, endDate: string) => {
  // Получение статистики
  // 🍪 Получение статистики через axios
  const { data: stats, isLoading, error, refetch } = useQuery<OperatorStats>({
    queryKey: ['operatorStats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/stats/my?${params}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate
  });

  // Мемоизированные функции
  const handleDateChange = useCallback(() => {
    if (startDate && endDate) {
      refetch();
    }
  }, [startDate, endDate, refetch]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  }, []);

  // Мемоизированная обработка ежедневной статистики
  const processedDailyStats = useMemo(() => {
    if (!stats?.dailyStats) return { sortedStats: [], maxCalls: 1 };

    // Группируем данные по датам и суммируем звонки
    const groupedStats = stats.dailyStats.reduce((acc, day) => {
      if (acc[day.date]) {
        acc[day.date].calls += day.calls;
      } else {
        acc[day.date] = { ...day };
      }
      return acc;
    }, {} as Record<string, { date: string; calls: number }>);

    // Сортируем по дате
    const sortedStats = Object.values(groupedStats).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const maxCalls = Math.max(...sortedStats.map(d => d.calls), 1);

    return { sortedStats, maxCalls };
  }, [stats?.dailyStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
    handleDateChange,
    formatDate,
    processedDailyStats
  };
};
