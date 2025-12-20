'use client';

import React, { useMemo } from 'react';
import { 
  Table, 
  // TableBody removed - not used 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { Phone } from 'lucide-react';
import { Call } from '@/types/telephony';
import { AudioPlayer } from './AudioPlayer';
import { CallRow } from './CallRow';

interface VirtualizedCallTableProps {
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
}

// Компонент для отображения группы звонков
const GroupHeader = React.memo(({ 
  phoneClient, 
  groupCalls, 
  isExpanded, 
  onToggleGroup,
  formatDate,
  getStatusBadge,
  onCreateOrder,
  onLoadOrderHistory,
  onDownloadRecording,
  onLoadRecording,
  playingCall,
  currentAudioUrl,
  onClosePlayer,
  orderHistoryLoading
}: {
  phoneClient: string;
  groupCalls: Call[];
  isExpanded: boolean;
  onToggleGroup: (phoneClient: string) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  onCreateOrder: (call: Call) => void;
  onLoadOrderHistory: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  onLoadRecording: (call: Call) => void;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onClosePlayer: () => void;
  orderHistoryLoading: boolean;
}) => {
  const latestCall = groupCalls[0];
  const hasMultipleCalls = groupCalls.length > 1;

  return (
    <TableRow className="hover:bg-gray-700/30 bg-gradient-to-r from-gray-800/10 to-transparent border-gray-600/20">
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          <div className="rounded-full w-3 h-3 bg-[#FFD700] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0f0f23]"></div>
          </div>
          {latestCall.rk}
        </div>
      </TableCell>
      
      <TableCell className="text-white">{latestCall.city}</TableCell>
      
      <TableCell>
        {latestCall.avitoName ? (
          <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
            {latestCall.avitoName}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>
      
      <TableCell className="font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#FFD700]">
            {phoneClient}
          </span>
          {hasMultipleCalls && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">
                +{groupCalls.length - 1}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleGroup(phoneClient)}
                className="h-7 w-7 p-0 hover:bg-[#FFD700]/10"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#FFD700]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#FFD700]" />
                )}
              </Button>
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell className="font-mono text-white">{latestCall.phoneAts}</TableCell>
      
      <TableCell className="text-white">
        {formatDate(latestCall.dateCreate)}
      </TableCell>
      
      <TableCell className="text-white">{latestCall.operator.name}</TableCell>
      
      <TableCell>{getStatusBadge(latestCall.status)}</TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <AudioPlayer 
            call={latestCall}
            playingCall={playingCall}
            currentAudioUrl={currentAudioUrl}
            onLoadRecording={onLoadRecording}
            onClosePlayer={onClosePlayer}
          />
          {latestCall.recordingPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadRecording(latestCall)}
              className="h-8 w-8 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onCreateOrder(latestCall)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
          >
            <FileText className="h-4 w-4" />
            Создать заказ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadOrderHistory(latestCall)}
            disabled={orderHistoryLoading}
            className="flex items-center justify-center gap-2 border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700]"
          >
            {orderHistoryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            История заказов
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

GroupHeader.displayName = 'GroupHeader';

export const VirtualizedCallTable: React.FC<VirtualizedCallTableProps> = ({
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
  onClosePlayer
}) => {
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

  // Подготовка данных для виртуализации
  const virtualizedData = useMemo(() => {
    const items: Array<{
      type: 'group' | 'call';
      data: unknown;
      phoneClient?: string;
    }> = [];

    Object.entries(groupedCalls).forEach(([phoneClient, groupCalls]) => {
      // Добавляем заголовок группы
      items.push({
        type: 'group',
        data: groupCalls,
        phoneClient
      });

      // Добавляем развернутые звонки если группа развернута
      if (expandedGroups.has(phoneClient)) {
        groupCalls.slice(1).forEach(call => {
          items.push({
            type: 'call',
            data: call,
            phoneClient
          });
        });
      }
    });

    return items;
  }, [groupedCalls, expandedGroups]);

  // Компонент для рендеринга элемента списка
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = virtualizedData[index];
    
    if (!item) return null;

    if (item.type === 'group') {
      return (
        <div style={style}>
          <GroupHeader
            phoneClient={item.phoneClient!}
            groupCalls={item.data as Call[]}
            isExpanded={expandedGroups.has(item.phoneClient!)}
            onToggleGroup={onToggleGroup}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            onCreateOrder={onCreateOrder}
            onLoadOrderHistory={onLoadOrderHistory}
            onDownloadRecording={onDownloadRecording}
            onLoadRecording={onLoadRecording}
            playingCall={playingCall}
            currentAudioUrl={currentAudioUrl}
            onClosePlayer={onClosePlayer}
            orderHistoryLoading={orderHistoryLoading}
          />
        </div>
      );
    }

    // Рендер отдельного звонка
    return (
      <div style={style}>
        <CallRow
          call={item.data as Call}
          phoneClient={item.phoneClient!}
          groupCalls={groupedCalls[item.phoneClient!]}
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
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-400">
        <div className="text-center">
          <p className="text-lg font-medium">Ошибка загрузки</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingState 
          message="Загрузка звонков..." 
          size="md"
        />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <EmptyState
          title="Звонки не найдены"
          description="Попробуйте изменить параметры фильтрации"
          icon={<Phone className="h-12 w-12 text-gray-300" />}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-[#0f0f23] border-[#FFD700]/30">
            <TableHead 
              className="cursor-pointer hover:bg-[#FFD700]/10 text-white"
              onClick={() => onSort('rk')}
            >
              РК {sortBy === 'rk' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-[#FFD700]/10 text-white"
              onClick={() => onSort('city')}
            >
              Город {sortBy === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-white">Источник</TableHead>
            <TableHead className="text-white">Кто звонил</TableHead>
            <TableHead className="text-white">Куда звонил</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-[#FFD700]/10 text-white"
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
      </Table>
      
      {/* Виртуализированный список */}
      <div 
        className="w-full virtualized-container"
        style={{ '--virtual-height': '600px' } as React.CSSProperties}
      >
        {virtualizedData.map((item, index) => (
          <div key={index} className="row-height">
            <Row index={index} style={{}} />
          </div>
        ))}
      </div>
    </div>
  );
};
