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
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import { LoadingState } from '@/components/ui/loading-state';
import { Call } from '@/types/telephony';

// Размеры для пагинации по группам
const GROUP_SIZES = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '50', label: '50' },
];
import { CallRowV4 } from './CallRowV4';
import { QuickFilterChips } from './QuickFilterChips';
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
  // Серверная пагинация
  currentPage: number;
  totalPages: number;
  totalCalls: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  // Статистика с сервера (опционально)
  stats?: {
    totalCalls: number;
    totalGroups: number;
    missedCalls: number;
    answeredCalls: number;
    todayCalls: number;
  };
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
  onLimitChange,
  stats
}) => {
<<<<<<< Updated upstream
=======
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  
>>>>>>> Stashed changes
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [stickyPlayerCall, setStickyPlayerCall] = useState<Call | null>(null);

  // Локальная фильтрация для поиска и быстрых фильтров
  // Серверная пагинация уже применена, здесь только дополнительная фильтрация на клиенте
  const filteredGroupedCalls = useMemo(() => {
    let filtered = { ...groupedCalls };
    
    // Поиск по номеру (локальный, в рамках загруженных данных)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([phone]) => 
          phone.toLowerCase().includes(term)
        )
      );
    }
    
    return filtered;
  }, [groupedCalls, searchTerm]);

  const displayedGroupsCount = Object.keys(filteredGroupedCalls).length;

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
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-[#0a4f42] dark:text-white" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-[#0a4f42] dark:text-white" />;
  };

  const isStickyPlayerVisible = stickyPlayerCall !== null && currentAudioUrl !== null;

  const hasNetworkError = Boolean(error);

  // V2 Design
  return (
      <>
        {hasNetworkError && (
          <div className={`mb-4 rounded-[16px] border px-4 py-3 text-sm ${
            isDark
              ? 'border-red-400/40 bg-red-500/10 text-red-100'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <span>Ошибка сети: данные не загрузились. Показываю интерфейс для проверки редизайна.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className={isDark ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : ''}
              >
                Повторить
              </Button>
            </div>
          </div>
        )}

        {/* Фильтры отдельно для V2 */}
        <div className={`mb-4 rounded-[20px] border p-4 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
          <QuickFilterChips
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Таблица V2 */}
        <Card className={`rounded-[20px] border font-myriad shadow-none ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto rounded-lg">
              <Table className="min-w-[700px] w-full">
                <TableHeader>
                  <TableRow className={`border-b-2 ${isDark ? 'bg-white/[0.04] border-white/20 hover:bg-white/[0.04]' : 'bg-gray-50 border-gray-200 hover:bg-gray-50'}`}>
                    <TableHead className="w-[18%] py-2 sm:py-3 px-2 sm:px-4">
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm">Клиент</span>
                    </TableHead>
                    <TableHead className="w-[22%] py-2 sm:py-3 px-2 sm:px-4">
                      <button 
                        onClick={() => onSort('city')}
                        className="flex items-center text-gray-800 dark:text-gray-200 font-medium hover:text-[#0a4f42] dark:hover:text-white transition-colors text-xs sm:text-sm"
                      >
                        Источник
                        <SortIcon field="city" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[18%] py-2 sm:py-3 px-2 sm:px-4">
                      <button 
                        onClick={() => onSort('createdAt')}
                        className="flex items-center text-gray-800 dark:text-gray-200 font-medium hover:text-[#0a4f42] dark:hover:text-white transition-colors text-xs sm:text-sm"
                      >
                        Дата и время
                        <SortIcon field="createdAt" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[20%] py-2 sm:py-3 px-2 sm:px-4">
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm">Оператор</span>
                    </TableHead>
                    <TableHead className="w-[22%] py-2 sm:py-3 px-2 sm:px-4 text-right">
                      <span className="text-gray-800 dark:text-gray-200 font-medium"></span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-12">
                        <LoadingState
                          isDark={isDark}
                          message="Загрузка звонков..."
                        />
                      </td>
                    </TableRow>
                  ) : displayedGroupsCount === 0 ? (
                    <TableRow>
                      <td colSpan={5} className="text-center py-12">
                        <EmptyState
                          title={hasNetworkError ? 'Не удалось загрузить звонки' : 'Звонки не найдены'}
                          description={hasNetworkError
                            ? 'Проверьте соединение и попробуйте снова.'
                            : searchTerm
                              ? 'Попробуйте изменить параметры фильтрации'
                              : 'Нет данных для отображения'
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

            {/* Пагинация V2 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">На странице:</Label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => {
                    onLimitChange(parseInt(value));
                    onPageChange(1);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className={`w-14 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                    isDark ? 'bg-white/[0.04] border-white/15 text-white' : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-gray-200'}>
                    {GROUP_SIZES.map((size) => (
                      <SelectItem 
                        key={size.value} 
                        value={size.value}
                        className={isDark ? 'text-white focus:bg-white/10 focus:text-white' : 'text-gray-800 focus:bg-black/5'}
                      >
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {totalPages > 1 && (
                <OptimizedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showFirstLast={false}
                  showPrevNext={true}
                  maxVisiblePages={3}
                  disabled={loading}
                  variant="v2"
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
