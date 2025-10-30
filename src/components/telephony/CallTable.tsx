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
// Button removed - not used
// Icons removed - not used
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { Phone } from 'lucide-react';
import { Call } from '@/types/telephony';
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
  groupedCallsCount: number;
  totalCalls: number;
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
  groupedCallsCount,
  totalCalls
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
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="p-2 bg-[#FFD700]/20 rounded-lg">
                <Phone className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Звонки</div>
                <div className="text-sm text-gray-400 font-normal">
                  {groupedCallsCount} групп • {totalCalls} звонков
                </div>
              </div>
            </div>
          </div>
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
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="p-2 bg-[#FFD700]/20 rounded-lg">
              <Phone className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Звонки</div>
              <div className="text-sm text-gray-400 font-normal">
                {groupedCallsCount} групп • {totalCalls} звонков
              </div>
            </div>
          </div>
        </div>
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
            <TableHead className="text-white">Авито аккаунт</TableHead>
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
                  icon={<Phone className="h-12 w-12 text-gray-300" />}
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
      </CardContent>
    </Card>
  );
};
