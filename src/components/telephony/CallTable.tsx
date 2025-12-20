'use client';

import React, { useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import { Call } from '@/types/telephony';
import { PAGE_SIZES } from '@/constants/orders';
// AudioPlayer removed - not used
import { CallRow } from './CallRow';

interface CallTableProps {
  calls: Call[];
  groupedCalls: Record<string, Call[]>;
  expandedGroups: Set<string>;
  loading: boolean;
  error: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  orderHistoryLoading: boolean;
  onToggleGroup: (phoneClient: string) => void;
  onSort: (field: string) => void;
  onCreateOrder: (call: Call) => void;
  onLoadOrderHistory: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  onLoadRecording: (call: Call) => void;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onClosePlayer: () => void;
  filtersComponent?: ReactNode;
  currentPage?: number;
  totalPages?: number;
  totalCalls?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const CallTable: React.FC<CallTableProps> = ({
  calls,
  groupedCalls,
  expandedGroups,
  loading,
  error,
  sortBy,
  sortOrder,
  orderHistoryLoading,
  onToggleGroup,
  onSort,
  onCreateOrder,
  onLoadOrderHistory,
  onDownloadRecording,
  onLoadRecording,
  playingCall,
  currentAudioUrl,
  onClosePlayer,
  filtersComponent,
  currentPage,
  totalPages,
  totalCalls,
  limit,
  onPageChange,
  onLimitChange
}) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      th:hover {
        background-color: transparent !important;
        background: transparent !important;
      }
      .table th:hover {
        background-color: transparent !important;
        background: transparent !important;
      }
      [data-slot="table-head"]:hover {
        background-color: transparent !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      answered: { label: 'Отвечен', variant: 'default' as const },
      missed: { label: 'Пропущен', variant: 'destructive' as const },
      busy: { label: 'Занято', variant: 'secondary' as const },
      no_answer: { label: 'Не отвечает', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'outline' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="px-6 pb-6">
          {filtersComponent && <div className="mb-6">{filtersComponent}</div>}
          <div className="flex items-center justify-center p-8 text-red-400">
            <div className="text-center">
              <p className="text-lg font-medium">Ошибка загрузки</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
      <CardContent className="px-6 pb-6">
        {filtersComponent && <div className="mb-6">{filtersComponent}</div>}
        <div className="overflow-x-auto w-full custom-scrollbar">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-[#0f0f23] border-[#FFD700]/30 hover:bg-[#0f0f23]">
            <TableHead 
              className="cursor-pointer text-white"
              onClick={() => onSort('rk')}
            >
              РК {sortBy === 'rk' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer text-white"
              onClick={() => onSort('city')}
            >
              Город {sortBy === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-white">Источник</TableHead>
            <TableHead className="text-white">Кто звонил</TableHead>
            <TableHead className="text-white">Куда звонил</TableHead>
            <TableHead 
              className="cursor-pointer text-white"
              onClick={() => onSort('dateCreate')}
            >
              Дата звонка {sortBy === 'dateCreate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-white">Оператор</TableHead>
            <TableHead className="text-white">Статус</TableHead>
            <TableHead className="text-white">Запись</TableHead>
            <TableHead className="text-white">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <LoadingState 
                  message="Загрузка звонков..." 
                  size="md"
                />
              </TableCell>
            </TableRow>
          ) : calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <EmptyState
                  title="Звонки не найдены"
                  description="Попробуйте изменить параметры фильтрации"
                />
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(groupedCalls).map(([phoneClient, groupCalls]) => {
              const isExpanded = expandedGroups.has(phoneClient);
              const latestCall = groupCalls[0];
              const hasMultipleCalls = groupCalls.length > 1;
              
              return (
                <React.Fragment key={phoneClient}>
                  {/* Основная строка с последним звонком */}
                  <CallRow
                    call={latestCall}
                    phoneClient={phoneClient}
                    groupCalls={groupCalls}
                    hasMultipleCalls={hasMultipleCalls}
                    isExpanded={isExpanded}
                    isMainRow={true}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onToggleGroup={onToggleGroup}
                    onCreateOrder={onCreateOrder}
                    onLoadOrderHistory={onLoadOrderHistory}
                    onDownloadRecording={onDownloadRecording}
                    onLoadRecording={onLoadRecording}
                    playingCall={playingCall}
                    currentAudioUrl={currentAudioUrl}
                    onClosePlayer={onClosePlayer}
                    orderHistoryLoading={orderHistoryLoading}
                  />
                  
                  {/* Развернутые звонки */}
                  {isExpanded && groupCalls.slice(1).map((call) => (
                    <CallRow
                      key={call.id}
                      call={call}
                      phoneClient={phoneClient}
                      groupCalls={groupCalls}
                      hasMultipleCalls={false}
                      isExpanded={false}
                      isMainRow={false}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                      onToggleGroup={onToggleGroup}
                      onCreateOrder={onCreateOrder}
                      onLoadOrderHistory={onLoadOrderHistory}
                      onDownloadRecording={onDownloadRecording}
                      onLoadRecording={onLoadRecording}
                      playingCall={playingCall}
                      currentAudioUrl={currentAudioUrl}
                      onClosePlayer={onClosePlayer}
                      orderHistoryLoading={orderHistoryLoading}
                    />
                  ))}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
        </div>

        {/* Pagination */}
        {currentPage && totalPages && totalCalls && limit && onPageChange && onLimitChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Показано {Object.keys(groupedCalls).length} групп из {totalCalls} звонков
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="page-size" className="text-sm text-gray-400">
                  Звонков на странице:
                </Label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    onLimitChange(parseInt(value));
                    onPageChange(1);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalPages > 1 && (
              <OptimizedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showFirstLast={true}
                showPrevNext={true}
                maxVisiblePages={5}
                disabled={loading}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
