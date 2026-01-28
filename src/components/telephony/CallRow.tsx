'use client';

import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown,
  ChevronUp,
  Plus,
  History,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Call } from '@/types/telephony';
import { AudioPlayer } from './AudioPlayer';

interface CallRowProps {
  call: Call;
  phoneClient: string;
  groupCalls: Call[];
  hasMultipleCalls: boolean;
  isExpanded: boolean;
  isMainRow: boolean;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  onToggleGroup: (phoneClient: string) => void;
  onCreateOrder: (call: Call) => void;
  onLoadOrderHistory: (call: Call) => void;
  onDownloadRecording: (call: Call) => void;
  onLoadRecording: (call: Call) => void;
  playingCall: number | null;
  currentAudioUrl: string | null;
  onClosePlayer: () => void;
  orderHistoryLoading: boolean;
}

export const CallRow: React.FC<CallRowProps> = React.memo(({
  call,
  phoneClient,
  groupCalls,
  hasMultipleCalls,
  isExpanded,
  isMainRow,
  formatDate,
  getStatusBadge,
  onToggleGroup,
  onCreateOrder,
  onLoadOrderHistory,
  onDownloadRecording,
  onLoadRecording,
  playingCall,
  currentAudioUrl,
  onClosePlayer,
  orderHistoryLoading
}) => {
  const rowClassName = isMainRow 
    ? "hover:bg-gray-700/30 bg-gradient-to-r from-gray-800/10 to-transparent border-gray-600/20"
    : "hover:bg-gray-700/20 bg-gradient-to-r from-gray-800/5 to-transparent border-gray-600/10";

  return (
    <TableRow className={rowClassName}>
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          <div className={`rounded-full ${isMainRow ? 'w-3 h-3 bg-[#FFD700]' : 'w-2 h-2 bg-[#FFD700]'} flex items-center justify-center`}>
            {isMainRow && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#0f0f23]"></div>
            )}
          </div>
          {call.rk}
        </div>
      </TableCell>
      
      <TableCell className="text-white">{call.city}</TableCell>
      
      <TableCell>
        {call.avitoName ? (
          <Badge variant="outline" className="border-[#FFD700]/30 text-[#FFD700]">
            {call.avitoName}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>
      
      <TableCell className="font-mono">
        <div className="flex items-center gap-3">
          {isMainRow ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-0.5 h-6 bg-[#FFD700]"></div>
              <span className="text-gray-300">{phoneClient}</span>
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell className="font-mono text-white">{call.phoneAts}</TableCell>
      
      <TableCell className={isMainRow ? "text-white" : "text-sm text-gray-300"}>
        {formatDate(call.dateCreate)}
      </TableCell>
      
      <TableCell className="text-white">{call.operator.name}</TableCell>
      
      <TableCell>{getStatusBadge(call.status)}</TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <AudioPlayer 
            call={call}
            playingCall={playingCall}
            currentAudioUrl={currentAudioUrl}
            onLoadRecording={onLoadRecording}
            onClosePlayer={onClosePlayer}
          />
          {call.recordingPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadRecording(call)}
              className="h-8 w-8 p-0 text-[#FFD700] hover:bg-[#FFD700]/10"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        {isMainRow ? (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => onCreateOrder(call, groupCalls)}
              className="flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#FFC700] text-[#0f0f23] font-semibold transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Новый заказ
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.call.id === nextProps.call.id &&
    prevProps.playingCall === nextProps.playingCall &&
    prevProps.currentAudioUrl === nextProps.currentAudioUrl &&
    prevProps.orderHistoryLoading === nextProps.orderHistoryLoading &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isMainRow === nextProps.isMainRow
  );
});

CallRow.displayName = 'CallRow';
