'use client';

import React from 'react';
import { Call } from '@/types/telephony';
import { CallCard } from './CallCard';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_SIZES } from '@/constants/orders';

interface CallsListViewProps {
  groupedCalls: Record<string, Call[]>;
  selectedPhone: string | null;
  loading: boolean;
  error: string | null;
  onSelectCall: (phoneClient: string) => void;
  onQuickPlay: (call: Call) => void;
  onQuickCreateOrder: (call: Call, group: Call[]) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCalls: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const CallsListView: React.FC<CallsListViewProps> = ({
  groupedCalls,
  selectedPhone,
  loading,
  error,
  onSelectCall,
  onQuickPlay,
  onQuickCreateOrder,
  currentPage,
  totalPages,
  totalCalls,
  limit,
  onPageChange,
  onLimitChange
}) => {
  const groupEntries = Object.entries(groupedCalls);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-red-400">Ошибка загрузки</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingState message="Загрузка звонков..." size="md" />
      </div>
    );
  }

  if (groupEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          title="Звонки не найдены"
          description="Попробуйте изменить параметры фильтрации"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Список карточек */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {groupEntries.map(([phoneClient, calls]) => {
          const latestCall = calls[0];
          
          return (
            <CallCard
              key={phoneClient}
              call={latestCall}
              callsInGroup={calls.length}
              isSelected={selectedPhone === phoneClient}
              onClick={() => onSelectCall(phoneClient)}
              onQuickPlay={() => onQuickPlay(latestCall)}
              onQuickCreateOrder={() => onQuickCreateOrder(latestCall, calls)}
            />
          );
        })}
      </div>

      {/* Пагинация */}
      <div className="flex-shrink-0 border-t border-[#FFD700]/20 p-4 bg-[#0f0f23]/50">
        <div className="flex flex-col gap-3">
          {/* Статистика и лимит */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {groupEntries.length} групп из {totalCalls} звонков
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-xs text-gray-500">
                На странице:
              </Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  onLimitChange(parseInt(value));
                  onPageChange(1);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-16 h-8 text-xs bg-[#17212b] border-[#FFD700]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                  {PAGE_SIZES.map((size) => (
                    <SelectItem 
                      key={size.value} 
                      value={size.value}
                      className="text-white focus:bg-[#FFD700]/20"
                    >
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <OptimizedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showFirstLast={false}
                showPrevNext={true}
                maxVisiblePages={3}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CallsListView.displayName = 'CallsListView';
