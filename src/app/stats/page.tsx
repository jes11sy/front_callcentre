'use client';

import { useState, useCallback } from 'react';
import { useDesignStore } from '@/store/designStore';
import { useStats } from '@/hooks/useStats';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
<<<<<<< Updated upstream
  BarChart3, 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  ShoppingCart, 
  Calendar,
  RefreshCw,
  TrendingUp,
  Target
=======
  RefreshCw
>>>>>>> Stashed changes
} from 'lucide-react';
import React from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

export default function StatsPage() {
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
  const hasNetworkError = Boolean(error);

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
      <div className="w-full min-h-screen font-myriad bg-[#f5f5f7] dark:bg-[#111113]">
        <div className="max-w-3xl mx-auto py-6 px-4">
          {hasNetworkError && (
            <div className={`mb-4 rounded-[16px] border px-4 py-3 text-sm ${
              isDark
                ? 'border-red-400/40 bg-red-500/10 text-red-100'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <span>Вы оффлайн или сервер недоступен. Интерфейс открыт, данные могут быть неактуальны.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className={isDark ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : ''}
                >
                  Повторить
                </Button>
              </div>
            </div>
          )}

          {!isLoading && (
            <Card className={`mb-4 rounded-[20px] border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="w-full sm:w-[380px]">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(nextStartDate, nextEndDate) => {
                  setStartDate(nextStartDate);
                  setEndDate(nextEndDate || nextStartDate);
                }}
                isDark={isDark}
              />
              </div>
              <Button 
                onClick={resetToCurrentPeriod} 
                variant="ghost" 
                size="sm"
                className={`h-10 border ${
                  isDark 
                    ? 'border-white/15 text-white hover:bg-white/10 hover:text-white' 
                    : 'border-gray-200 text-gray-600 hover:bg-black/[0.03] hover:text-gray-900'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="min-h-[60vh]">
              <LoadingState isDark={isDark} message="Загрузка статистики..." fullPage />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Звонки */}
              <Card className={`rounded-[20px] border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
                <CardContent className="p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Звонки</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.calls.total}</span>
                </div>
                
                {/* Прогресс-бар */}
                <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isDark ? 'bg-white' : 'bg-[#0a4f42]'}`}
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
                </CardContent>
              </Card>

              {/* Заказы */}
              <Card className={`rounded-[20px] border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
                <CardContent className="p-4">
                <div className="flex items-baseline justify-between">
                  <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Заказы</span>
                  <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.orders.total}</span>
                </div>
<<<<<<< Updated upstream
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
=======
                <p className={`text-xs sm:text-sm font-light mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>за период</p>
                </CardContent>
              </Card>

              {/* Ежедневная динамика */}
              <Card className={`rounded-[20px] border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>По дням</span>
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {processedDailyStats.sortedStats.length} дн.
                    </span>
                  </div>
                  <div className="space-y-3">
                    {processedDailyStats.sortedStats.length > 0 ? (
                      processedDailyStats.sortedStats.map((day) => (
                        <div key={day.date} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(day.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-24 sm:w-36 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                              <div
                                className={`h-full rounded-full ${isDark ? 'bg-white' : 'bg-[#0a4f42]'}`}
                                style={{ width: `${Math.min((day.calls / processedDailyStats.maxCalls) * 100, 100)}%` }}
                              />
                            </div>
                            <span className={`w-7 text-right text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{day.calls}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Нет данных за выбранный период</p>
                    )}
                  </div>
                </CardContent>
              </Card>
>>>>>>> Stashed changes
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
