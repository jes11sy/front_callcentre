'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDesignStore } from '@/store/designStore';
import { useStats } from '@/hooks/useStats';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  ShoppingCart, 
  Calendar,
  RefreshCw,
  TrendingUp,
  Target
} from 'lucide-react';
import React from 'react';
import { ErrorMessage, LoadingState } from '@/components/ui/error-boundary';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

interface _OperatorStats {
  operator: {
    id: number;
    name: string;
    city: string;
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
    city: string;
    calls: number;
  }>;
  rkStats: Array<{
    rk: string;
    calls: number;
  }>;
}

// Компонент для отображения ежедневной статистики с мемоизацией тяжелых вычислений
const DailyStatsList = ({ 
  processedStats, 
  formatDate,
  isDark = false
}: { 
  processedStats: { sortedStats: Array<{ date: string; calls: number }>; maxCalls: number }; 
  formatDate: (dateString: string) => string;
  isDark?: boolean;
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {processedStats.sortedStats.map((day, index) => (
        <div key={`${day.date}-${index}`} className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border shrink-0 bg-[#FEC004]/20 border-[#FEC004]/30">
              <span className="text-xs sm:text-sm font-medium text-[#FEC004]">
                {new Date(day.date).getDate()}
              </span>
            </div>
            <div className="min-w-0">
              <p className={`text-sm sm:text-base font-medium truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(day.date)}</p>
              <p className={`text-xs sm:text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className={`w-16 sm:w-32 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-2 rounded-full progress-bar bg-[#FEC004]"
                style={{ 
                  '--progress-width': `${Math.min((day.calls / processedStats.maxCalls) * 100, 100)}%` 
                } as React.CSSProperties}
              ></div>
            </div>
            <span className={`text-xs sm:text-sm font-medium w-6 sm:w-8 text-right ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{day.calls}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Используем кастомный хук для статистики
  const { stats, isLoading, error, refetch, formatDate, processedDailyStats } = useStats(startDate, endDate);

  const resetToCurrentPeriod = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  if (error) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-[#F3F3EE] dark:bg-[#111827]`}>
          <div className="px-4 py-6 sm:px-0">
            <ErrorMessage 
              error={error.message || 'Ошибка при загрузке статистики'}
              onRetry={() => refetch()}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Минималистичный дизайн с горизонтальными прогресс-барами
  const acceptanceRate = stats?.calls.total ? Math.round((stats.calls.accepted / stats.calls.total) * 100) : 0;
  const missedRate = stats?.calls.total ? Math.round((stats.calls.missed / stats.calls.total) * 100) : 0;
  const conversionRate = stats?.calls.accepted ? Math.round((stats.orders.total / stats.calls.accepted) * 100) : 0;
  const daysInPeriod = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 1;
  const avgCallsPerDay = stats?.calls.total ? Math.round(stats.calls.total / daysInPeriod) : 0;
  const avgOrdersPerDay = stats?.orders.total ? (stats.orders.total / daysInPeriod).toFixed(1) : '0';

  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className={`w-full min-h-screen font-myriad transition-colors duration-300 ${
        isDark ? 'bg-[#111827]' : 'bg-[#F3F3EE]'
      }`}>
        <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
        {/* Date Filter */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`flex-1 sm:flex-none sm:w-[140px] h-10 sm:h-9 text-sm font-light ${
                  isDark 
                    ? 'bg-[#252d3a] border-gray-600 text-gray-100 [color-scheme:dark]' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
              <span className="text-gray-400">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`flex-1 sm:flex-none sm:w-[140px] h-10 sm:h-9 text-sm font-light ${
                  isDark 
                    ? 'bg-[#252d3a] border-gray-600 text-gray-100 [color-scheme:dark]' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <Button 
              onClick={resetToCurrentPeriod} 
              variant="ghost" 
              size="sm"
              className={`h-10 sm:h-9 hover:text-[#FEC004] font-light ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          </div>

          {isLoading ? (
            <LoadingState message="Загрузка статистики..." className="py-12" />
          ) : stats ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Звонки */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Звонки</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.calls.total}</span>
                </div>
                
                {/* Прогресс-бар */}
                <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-[#FEC004] rounded-full transition-all duration-500"
                    style={{ width: `${acceptanceRate}%` }}
                  />
                </div>
                
                {/* Принятые / Пропущенные */}
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-sm">
                  <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Принятые: <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{stats.calls.accepted}</span>
                    <span className={`ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({acceptanceRate}%)</span>
                  </span>
                  <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Пропущенные: <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{stats.calls.missed}</span>
                    <span className={`ml-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({missedRate}%)</span>
                  </span>
                </div>
              </div>

              {/* Заказы */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                <div className="flex items-baseline justify-between">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Заказы</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.orders.total}</span>
                </div>
                <p className={`text-xs sm:text-sm font-light mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  в среднем {avgOrdersPerDay} заказа/день
                </p>
              </div>

              {/* Конверсия */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Конверсия</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{conversionRate}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-[#FEC004] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(conversionRate, 100)}%` }}
                  />
                </div>
                <p className={`text-xs sm:text-sm font-light ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  заказов на принятый звонок: <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{stats.calls.accepted > 0 ? `${stats.orders.total}/${stats.calls.accepted}` : '—'}</span>
                </p>
              </div>

              {/* Нагрузка */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                <div className="flex items-baseline justify-between">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Средняя нагрузка</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{avgCallsPerDay}</span>
                </div>
                <p className={`text-xs sm:text-sm font-light mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>звонков в день</p>
              </div>

              {/* Разбивка по статусам заказов */}
              {stats.orders.byStatus && Object.keys(stats.orders.byStatus).length > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Заказы по статусам</span>
                  <div className="mt-3 space-y-2">
                    {Object.entries(stats.orders.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{status}</span>
                        <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
