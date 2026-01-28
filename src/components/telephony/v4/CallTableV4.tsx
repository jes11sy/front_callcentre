'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import { Call } from '@/types/telephony';
import { PAGE_SIZES } from '@/constants/orders';
import { CallRowV4 } from './CallRowV4';
import { QuickFilterChips, QuickFilter } from './QuickFilterChips';
import { StickyAudioPlayer } from '../v2/StickyAudioPlayer';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallTableV4Props {
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
  onCreateOrder: (call: Call, group: Call[]) => void;
  onLoadOrderHistory: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  onLoadRecording: (call: Call) => void;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onClosePlayer: () => void;
  currentPage: number;
  totalPages: number;
  totalCalls: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const CallTableV4: React.FC<CallTableV4Props> = ({
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
  currentPage,
  totalPages,
  totalCalls,
  limit,
  onPageChange,
  onLimitChange
}) => {
  // Local state
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stickyPlayerCall, setStickyPlayerCall] = useState<Call | null>(null);

  // Подсчёт для фильтров
  const filterCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      all: calls.length,
      missed: calls.filter(c => c.status === 'missed').length,
      answered: calls.filter(c => c.status === 'answered').length,
      today: calls.filter(c => {
        const callDate = new Date(c.dateCreate);
        callDate.setHours(0, 0, 0, 0);
        return callDate.getTime() === today.getTime();
      }).length
    };
  }, [calls]);

  // Фильтрация
  const filteredGroupedCalls = useMemo(() => {
    let filtered = { ...groupedCalls };
    
    // Поиск по номеру
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([phone]) => 
          phone.toLowerCase().includes(term)
        )
      );
    }
    
    // Быстрые фильтры
    if (activeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, calls]) => {
          const latestCall = calls[0];
          const callDate = new Date(latestCall.dateCreate);
          
          switch (activeFilter) {
            case 'missed':
              return latestCall.status === 'missed';
            case 'answered':
              return latestCall.status === 'answered';
            case 'today':
              const callDay = new Date(callDate);
              callDay.setHours(0, 0, 0, 0);
              return callDay.getTime() === today.getTime();
            case 'last_hour':
              return callDate >= hourAgo;
            default:
              return true;
          }
        })
      );
    }
    
    return filtered;
  }, [groupedCalls, searchTerm, activeFilter]);

  // Handlers
  const handlePlayRecording = useCallback((call: Call) => {
    setStickyPlayerCall(call);
    onLoadRecording(call);
  }, [onLoadRecording]);

  const handleCloseStickyPlayer = useCallback(() => {
    setStickyPlayerCall(null);
    onClosePlayer();
  }, [onClosePlayer]);

  // Sort icon
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-[#FFD700]" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-[#FFD700]" />;
  };

  const isStickyPlayerVisible = stickyPlayerCall !== null && currentAudioUrl !== null;

  if (error) {
    return (
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="p-6">
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
    <>
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="p-4">
          {/* Быстрые фильтры */}
          <div className="mb-4">
            <QuickFilterChips
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              counts={filterCounts}
            />
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto rounded-lg border border-[#FFD700]/20">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="bg-[#0f0f23] border-[#FFD700]/20 hover:bg-[#0f0f23]">
                  <TableHead className="w-[18%] py-3 px-4">
                    <span className="text-white font-medium">Клиент</span>
                  </TableHead>
                  <TableHead className="w-[22%] py-3 px-4">
                    <button 
                      onClick={() => onSort('city')}
                      className="flex items-center text-white font-medium hover:text-[#FFD700] transition-colors"
                    >
                      Источник
                      <SortIcon field="city" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[18%] py-3 px-4">
                    <button 
                      onClick={() => onSort('dateCreate')}
                      className="flex items-center text-white font-medium hover:text-[#FFD700] transition-colors"
                    >
                      Дата и время
                      <SortIcon field="dateCreate" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[20%] py-3 px-4">
                    <span className="text-white font-medium">Оператор</span>
                  </TableHead>
                  <TableHead className="w-[22%] py-3 px-4 text-right">
                    <span className="text-white font-medium">Действия</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <td colSpan={5} className="text-center py-12">
                      <LoadingState message="Загрузка звонков..." size="md" />
                    </td>
                  </TableRow>
                ) : Object.keys(filteredGroupedCalls).length === 0 ? (
                  <TableRow>
                    <td colSpan={5} className="text-center py-12">
                      <EmptyState
                        title="Звонки не найдены"
                        description={searchTerm || activeFilter !== 'all' 
                          ? "Попробуйте изменить параметры фильтрации" 
                          : "Нет данных для отображения"
                        }
                      />
                    </td>
                  </TableRow>
                ) : (
                  Object.entries(filteredGroupedCalls).map(([phoneClient, groupCalls]) => {
                    const isExpanded = expandedGroups.has(phoneClient);
                    const latestCall = groupCalls[0];
                    const hasMultipleCalls = groupCalls.length > 1;
                    
                    return (
                      <React.Fragment key={phoneClient}>
                        <CallRowV4
                          call={latestCall}
                          phoneClient={phoneClient}
                          groupCalls={groupCalls}
                          hasMultipleCalls={hasMultipleCalls}
                          isExpanded={isExpanded}
                          isMainRow={true}
                          onToggleGroup={onToggleGroup}
                          onCreateOrder={onCreateOrder}
                          onLoadOrderHistory={onLoadOrderHistory}
                          onPlayRecording={handlePlayRecording}
                          onDownloadRecording={onDownloadRecording}
                          isPlaying={playingCall === latestCall.id}
                          orderHistoryLoading={orderHistoryLoading}
                        />
                        
                        {isExpanded && groupCalls.slice(1).map((call) => (
                          <CallRowV4
                            key={call.id}
                            call={call}
                            phoneClient={phoneClient}
                            groupCalls={groupCalls}
                            hasMultipleCalls={false}
                            isExpanded={false}
                            isMainRow={false}
                            onToggleGroup={onToggleGroup}
                            onCreateOrder={onCreateOrder}
                            onLoadOrderHistory={onLoadOrderHistory}
                            onPlayRecording={handlePlayRecording}
                            onDownloadRecording={onDownloadRecording}
                            isPlaying={playingCall === call.id}
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

          {/* Пагинация */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {Object.keys(filteredGroupedCalls).length} групп из {totalCalls} звонков
                {(searchTerm || activeFilter !== 'all') && (
                  <span className="text-[#FFD700] ml-1">(отфильтровано)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-500">На странице:</Label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    onLimitChange(parseInt(value));
                    onPageChange(1);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-20 h-8 bg-[#0f0f23] border-[#FFD700]/20">
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
        </CardContent>
      </Card>

      {/* Sticky Audio Player */}
      <StickyAudioPlayer
        call={stickyPlayerCall}
        audioUrl={currentAudioUrl}
        isVisible={isStickyPlayerVisible}
        onClose={handleCloseStickyPlayer}
        onDownload={onDownloadRecording}
      />

      {/* Spacer for sticky player */}
      {isStickyPlayerVisible && <div className="h-20" />}
    </>
  );
};

CallTableV4.displayName = 'CallTableV4';
