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
  RefreshCw
} from 'lucide-react';
import React from 'react';
import { ErrorMessage, LoadingState } from '@/components/ui/error-boundary';

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
  isV2 = false
}: { 
  processedStats: { sortedStats: Array<{ date: string; calls: number }>; maxCalls: number }; 
  formatDate: (dateString: string) => string;
  isV2?: boolean;
}) => {
  return (
    <div className="space-y-4">
      {processedStats.sortedStats.map((day, index) => (
        <div key={`${day.date}-${index}`} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
              isV2 
                ? 'bg-[#FEC004]/20 border-[#FEC004]/30'
                : 'bg-[#FFD700]/20 border-[#FFD700]/30'
            }`}>
              <span className={`text-sm font-medium ${isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]'}`}>
                {new Date(day.date).getDate()}
              </span>
            </div>
            <div>
              <p className={`font-medium ${isV2 ? 'text-gray-900' : 'text-white'}`}>{formatDate(day.date)}</p>
              <p className={`text-sm ${isV2 ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-32 rounded-full h-2 ${isV2 ? 'bg-gray-200' : 'bg-gray-600'}`}>
              <div 
                className={`h-2 rounded-full progress-bar ${isV2 ? 'bg-[#FEC004]' : 'bg-[#FFD700]'}`}
                style={{ 
                  '--progress-width': `${Math.min((day.calls / processedStats.maxCalls) * 100, 100)}%` 
                } as React.CSSProperties}
              ></div>
            </div>
            <span className={`text-sm font-medium w-8 text-right ${isV2 ? 'text-gray-900' : 'text-white'}`}>{day.calls}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Используем кастомный хук для статистики
  const { stats, isLoading, error, refetch, formatDate, processedDailyStats } = useStats(startDate, endDate);

  const resetToCurrentPeriod = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  // Общие стили для V2
  const cardClass = isV2 
    ? "border border-gray-200 bg-white font-myriad"
    : "border-2 border-[#FFD700]/30 bg-[#17212b]";
  
  const inputClass = isV2 
    ? "w-[160px] h-9 bg-white border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004]"
    : "w-[160px] h-9 bg-[#0f0f23] border-gray-600 text-white text-sm placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]";

  if (error) {
    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${isV2 ? 'bg-[#F3F3EE] dark:bg-[#111827]' : ''}`}>
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

  // V2: Минималистичный дизайн с горизонтальными прогресс-барами
  if (isV2) {
    const acceptanceRate = stats?.calls.total ? Math.round((stats.calls.accepted / stats.calls.total) * 100) : 0;
    const missedRate = stats?.calls.total ? Math.round((stats.calls.missed / stats.calls.total) * 100) : 0;

    return (
      <DashboardLayout variant="operator" requiredRole="operator">
        <div className="max-w-3xl mx-auto py-8 px-6 min-h-screen bg-[#F3F3EE] dark:bg-[#111827] font-myriad">
          {/* Date Filter */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] h-9 bg-white border-gray-200 text-gray-900 text-sm font-light"
              />
              <span className="text-gray-400">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px] h-9 bg-white border-gray-200 text-gray-900 text-sm font-light"
              />
            </div>
            <Button 
              onClick={resetToCurrentPeriod} 
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-[#FEC004] font-light"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          </div>

          {isLoading ? (
            <LoadingState message="Загрузка статистики..." className="py-12" />
          ) : stats ? (
            <div className="space-y-8">
              {/* Звонки */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-gray-800 font-light">Звонки</span>
                  <span className="text-2xl font-light text-gray-900">{stats.calls.total}</span>
                </div>
                
                {/* Прогресс-бар */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-[#FEC004] rounded-full transition-all duration-500"
                    style={{ width: `${acceptanceRate}%` }}
                  />
                </div>
                
                {/* Принятые / Пропущенные */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-light">
                    Принятые: <span className="text-gray-900">{stats.calls.accepted}</span>
                    <span className="text-gray-400 ml-1">({acceptanceRate}%)</span>
                  </span>
                  <span className="text-gray-600 font-light">
                    Пропущенные: <span className="text-gray-900">{stats.calls.missed}</span>
                    <span className="text-gray-400 ml-1">({missedRate}%)</span>
                  </span>
                </div>
              </div>

              {/* Разделитель */}
              <div className="border-b border-gray-200" />

              {/* Заказы */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-800 font-light">Заказы</span>
                  <span className="text-2xl font-light text-gray-900">{stats.orders.total}</span>
                </div>
                <p className="text-sm text-gray-400 font-light mt-1">за период</p>
              </div>
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    );
  }

  // V1: Оригинальный дизайн с карточками
  return (
    <DashboardLayout variant="operator" requiredRole="operator">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 min-h-screen bg-[#0f0f23]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center text-[#FFD700]">
                  <BarChart3 className="h-8 w-8 mr-3 text-[#FFD700]" />
                  Моя статистика
                </h1>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <Card className={`mb-8 ${cardClass}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 shrink-0 text-[#FFD700]" />
                  <span className="text-lg font-semibold shrink-0 text-white">Период анализа</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs text-gray-400">С</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  
                  <div className="pt-5">
                    <span className="text-gray-400">—</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-xs text-gray-400">По</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  
                  <Button 
                    onClick={resetToCurrentPeriod} 
                    variant="outline" 
                    size="sm"
                    className="h-9 mt-5 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:text-[#FFD700]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Сбросить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <LoadingState 
              message="Загрузка статистики..." 
              className="py-12"
            />
          ) : stats ? (
            <div className="space-y-6">
              {/* Main Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={cardClass}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Всего звонков</CardTitle>
                    <Phone className="h-4 w-4 text-[#FFD700]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.calls.total}</div>
                    <p className="text-xs text-gray-400">за период</p>
                  </CardContent>
                </Card>

                <Card className={cardClass}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Принятые звонки</CardTitle>
                    <PhoneCall className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">{stats.calls.accepted}</div>
                    <p className="text-xs text-gray-400">{stats.calls.acceptanceRate}% от общего числа</p>
                  </CardContent>
                </Card>

                <Card className={cardClass}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Пропущенные звонки</CardTitle>
                    <PhoneOff className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">{stats.calls.missed}</div>
                    <p className="text-xs text-gray-400">
                      {stats.calls.total > 0 ? Math.round((stats.calls.missed / stats.calls.total) * 100) : 0}% от общего числа
                    </p>
                  </CardContent>
                </Card>

                <Card className={cardClass}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Созданные заказы</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-[#FFD700]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#FFD700]">{stats.orders.total}</div>
                    <p className="text-xs text-gray-400">за период</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Stats */}
              <Card className={cardClass}>
                <CardHeader>
                  <CardTitle className="text-white">Активность по дням</CardTitle>
                  <CardDescription className="text-gray-400">
                    Количество звонков за последние 7 дней
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyStatsList processedStats={processedDailyStats} formatDate={formatDate} isV2={false} />
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
