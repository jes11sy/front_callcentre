'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Phone,
  Play,
  User
} from 'lucide-react';

interface Call {
  id: number;
  rkId?: number;
  rk?: { id: number; name: string };
  cityId?: number;
  city?: { id: number; name: string };
  phoneClient: string;
  phoneAts: string;
  createdAt: string;
  duration?: number;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  callDirection: 'inbound' | 'outbound' | 'callback';
  masterId?: number | null;
  recordingPath?: string;
  operator?: { id: number; name: string; login: string };
  avito?: { id: number; name: string };
}

interface CallHistoryPanelProps {
  callHistory: Call[];
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  currentCallId?: number;
  playingCallId: number | null;
  onPlayRecording: (call: Call) => void;
  formatDate: (dateString: string) => string;
  formatDuration: (seconds?: number) => string;
  formatPhoneDisplay: (phone: string) => string;
}

export const CallHistoryPanel = React.memo(({
  callHistory,
  loading,
  isOpen,
  onToggle,
  currentCallId,
  playingCallId,
  onPlayRecording,
  formatDate,
  formatDuration,
  formatPhoneDisplay,
}: CallHistoryPanelProps) => (
  <div className="border-b flex flex-col overflow-hidden lg:max-h-[50%] border-gray-200 dark:border-gray-700">
    <button
      onClick={onToggle}
      className="w-full px-3 py-2.5 sm:py-2 flex items-center justify-between text-xs sm:text-sm lg:text-xs font-medium transition-colors shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
    >
      <div className="flex items-center gap-2">
        <PhoneCall className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        <span>История звонков ({loading ? '...' : callHistory.length})</span>
      </div>
      {isOpen ? <ChevronUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <ChevronDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
    </button>
    {isOpen && (
      <ScrollArea className="flex-1 max-h-[200px] lg:max-h-[280px]">
        <div className="px-2 pb-2 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          ) : callHistory.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              Звонков не найдено
            </div>
          ) : (
            callHistory.map((c) => {
              const isOutgoing = c.callDirection === 'outbound' || c.callDirection === 'callback';
              const isCallback = c.callDirection === 'callback';
              const isCurrentCall = c.id === currentCallId;

              return (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-lg text-xs transition-colors ${
                    isCurrentCall
                      ? 'bg-[#FEC004]/10 border border-[#FEC004]/30'
                      : 'bg-gray-50 dark:bg-[#252d3a] hover:bg-gray-100 dark:hover:bg-[#2d3748]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(c.createdAt)}</span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {isOutgoing ? <PhoneOutgoing className="h-2.5 w-2.5" /> : <PhoneIncoming className="h-2.5 w-2.5" />}
                        {isCallback ? 'От мастера' : isOutgoing ? 'Исход.' : 'Вход.'}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 ${c.status === 'answered' ? 'text-gray-600' : 'text-red-500'}`}>
                      {c.status === 'answered' ? <PhoneCall className="h-3 w-3" /> : <PhoneMissed className="h-3 w-3" />}
                      {formatDuration(c.duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.operator?.name || 'Без оператора'}</span>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                    <span className="shrink-0 text-gray-700 dark:text-gray-300 font-medium">{c.rk?.name || '—'}</span>
                    <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                    <span className="shrink-0">{c.city?.name || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Phone className="h-3 w-3" />
                      <span className="font-mono text-[11px]">{formatPhoneDisplay(c.phoneClient)}</span>
                    </div>
                    {c.recordingPath && (
                      <button
                        onClick={() => onPlayRecording(c)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                          playingCallId === c.id
                            ? 'bg-[#FEC004]/20 text-[#FEC004]'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-[#FEC004] hover:bg-[#FEC004]/10'
                        }`}
                      >
                        <Play className="h-3 w-3" />
                        {playingCallId === c.id ? 'Играет...' : 'Запись'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    )}
  </div>
));

CallHistoryPanel.displayName = 'CallHistoryPanel';
