'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Phone,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { getFormDateFieldClass } from '@/components/ui/form-styles';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

interface ProfileStats {
  operator: {
    id: number;
    name: string;
    city: string;
    startDate: string;
  };
  total: {
    calls: number;
    orders: number;
  };
  monthly: {
    calls: number;
    orders: number;
  };
  today: {
    calls: number;
    orders: number;
  };
}

interface PeriodStats {
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
  dailyStats: Array<{ date: string; calls: number }>;
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

export default function SalaryPage() {
  const { theme } = useDesignStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';
  const dateFieldClass = getFormDateFieldClass(isDark, 'sm');

  const defaultRange = getMonthRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const { data: profileStats, isLoading: profileLoading } = useQuery<ProfileStats>({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await api.get('/auth/profile/stats');
      return response.data.data || response.data;
    },
  });

  const { data: periodStats, isLoading: periodLoading, refetch } = useQuery<PeriodStats>({
    queryKey: ['salaryPeriodStats', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      const response = await api.get(`/stats/my?${params}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });

  const isLoading = profileLoading || periodLoading;

  const conversionRate = periodStats?.calls.accepted
    ? Math.round((periodStats.orders.total / periodStats.calls.accepted) * 100)
    : 0;

  const daysInPeriod = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 1;

  const resetToCurrentMonth = () => {
    const range = getMonthRange();
    setStartDate(range.start);
    setEndDate(range.end);
  };

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
                className={`flex-1 sm:flex-none sm:w-[140px] h-10 sm:h-9 text-sm font-light ${dateFieldClass}`}
              />
              <span className="text-gray-400">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`flex-1 sm:flex-none sm:w-[140px] h-10 sm:h-9 text-sm font-light ${dateFieldClass}`}
              />
            </div>
            <Button
              onClick={resetToCurrentMonth}
              variant="ghost"
              size="sm"
              className={`h-10 sm:h-9 hover:text-[#FEC004] font-light ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Текущий месяц
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#FEC004]" />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">

              {/* Заголовок с именем */}
              {profileStats && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Оператор</p>
                      <p className={`text-lg font-medium mt-0.5 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.operator.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Город</p>
                      <p className={`text-base mt-0.5 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.operator.city}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Звонки за период */}
              {periodStats && (
                <>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Звонки за период</span>
                      <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{periodStats.calls.total}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-[#FEC004] rounded-full transition-all duration-500"
                        style={{ width: `${periodStats.calls.total ? Math.round((periodStats.calls.accepted / periodStats.calls.total) * 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 text-sm">
                      <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Принятые: <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{periodStats.calls.accepted}</span>
                      </span>
                      <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Пропущенные: <span className={isDark ? 'text-gray-100' : 'text-gray-900'}>{periodStats.calls.missed}</span>
                      </span>
                    </div>
                  </div>

                  {/* Заказы за период */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Заказы за период</span>
                      <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{periodStats.orders.total}</span>
                    </div>
                    <p className={`text-xs sm:text-sm font-light mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {daysInPeriod > 1 ? `в среднем ${(periodStats.orders.total / daysInPeriod).toFixed(1)} заказа/день` : 'за выбранный день'}
                    </p>
                    {periodStats.orders.byStatus && Object.keys(periodStats.orders.byStatus).length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {Object.entries(periodStats.orders.byStatus).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between text-sm">
                            <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{status}</span>
                            <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Конверсия */}
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className={`text-sm sm:text-base font-light ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Конверсия</span>
                      <span className={`text-xl sm:text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{conversionRate}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full bg-[#FEC004] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(conversionRate, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs sm:text-sm font-light mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      заказов на принятый звонок
                    </p>
                  </div>
                </>
              )}

              {/* Итого за всё время */}
              {profileStats && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                  <p className={`text-sm font-light mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Всё время</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.total.calls}</p>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>звонков</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.total.orders}</p>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>заказов</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Сегодня */}
              {profileStats && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e2530]' : 'bg-white'}`}>
                  <p className={`text-sm font-light mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Сегодня</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.today.calls}</p>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>звонков</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profileStats.today.orders}</p>
                      <p className={`text-sm font-light ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>заказов</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
