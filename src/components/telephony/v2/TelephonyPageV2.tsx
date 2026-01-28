'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Call } from '@/types/telephony';
import { CallsListView } from './CallsListView';
import { CallDetailPanel } from './CallDetailPanel';
import { QuickFilters } from './QuickFilters';
import { StickyAudioPlayer } from './StickyAudioPlayer';
import { cn } from '@/lib/utils';

interface TelephonyPageV2Props {
  // Data
  calls: Call[];
  groupedCalls: Record<string, Call[]>;
  loading: boolean;
  error: string | null;
  totalCalls: number;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  limit: number;
  
  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Form
  register: any;
  handleSubmit: any;
  errors: any;
  
  // Functions
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
  onFiltersSubmit: (data: any) => void;
  clearFilters: () => void;
  handleSort: (field: string) => void;
  
  // Actions
  loadRecording: (call: Call) => void;
  closePlayer: () => void;
  downloadRecording: (call: Call) => void;
  createOrderFromCall: (call: Call, group: Call[]) => void;
  loadOrderHistory: (call: Call) => void;
  
  // Player state
  playingCall: number | null;
  currentAudioUrl: string | null;
  orderHistoryLoading: boolean;
  
  // Modals
  setShowCreateOrderModal: (show: boolean) => void;
  setShowOrderHistoryModal: (show: boolean) => void;
}

export const TelephonyPageV2: React.FC<TelephonyPageV2Props> = ({
  calls,
  groupedCalls,
  loading,
  error,
  totalCalls,
  currentPage,
  totalPages,
  limit,
  sortBy,
  sortOrder,
  register,
  handleSubmit,
  errors,
  setCurrentPage,
  setLimit,
  onFiltersSubmit,
  clearFilters,
  handleSort,
  loadRecording,
  closePlayer,
  downloadRecording,
  createOrderFromCall,
  loadOrderHistory,
  playingCall,
  currentAudioUrl,
  orderHistoryLoading,
  setShowCreateOrderModal,
  setShowOrderHistoryModal
}) => {
  // Local state
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'missed' | 'today' | 'answered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stickyPlayerCall, setStickyPlayerCall] = useState<Call | null>(null);

  // Получаем выбранный звонок и его группу
  const selectedCallData = useMemo(() => {
    if (!selectedPhone || !groupedCalls[selectedPhone]) {
      return { call: null, group: [] };
    }
    return {
      call: groupedCalls[selectedPhone][0],
      group: groupedCalls[selectedPhone]
    };
  }, [selectedPhone, groupedCalls]);

  // Подсчёт пропущенных звонков
  const missedCount = useMemo(() => {
    return calls.filter(c => c.status === 'missed').length;
  }, [calls]);

  // Фильтрация по быстрым фильтрам
  const filteredGroupedCalls = useMemo(() => {
    let filtered = { ...groupedCalls };
    
    // Фильтр по поиску
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([phone]) => 
          phone.toLowerCase().includes(term)
        )
      );
    }
    
    // Быстрые фильтры
    if (activeQuickFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, calls]) => {
          const latestCall = calls[0];
          
          switch (activeQuickFilter) {
            case 'missed':
              return latestCall.status === 'missed';
            case 'answered':
              return latestCall.status === 'answered';
            case 'today':
              const callDate = new Date(latestCall.dateCreate);
              callDate.setHours(0, 0, 0, 0);
              return callDate.getTime() === today.getTime();
            default:
              return true;
          }
        })
      );
    }
    
    return filtered;
  }, [groupedCalls, searchTerm, activeQuickFilter]);

  // Handlers
  const handleSelectCall = useCallback((phoneClient: string) => {
    setSelectedPhone(prev => prev === phoneClient ? null : phoneClient);
  }, []);

  const handleQuickPlay = useCallback((call: Call) => {
    setStickyPlayerCall(call);
    loadRecording(call);
  }, [loadRecording]);

  const handleQuickCreateOrder = useCallback((call: Call, group: Call[]) => {
    createOrderFromCall(call, group);
  }, [createOrderFromCall]);

  const handleCloseStickyPlayer = useCallback(() => {
    setStickyPlayerCall(null);
    closePlayer();
  }, [closePlayer]);

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedPhone(null);
  }, []);

  const isPanelOpen = selectedPhone !== null;
  const isStickyPlayerVisible = stickyPlayerCall !== null && currentAudioUrl !== null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0f0f23]">
      {/* Фильтры */}
      <div className="flex-shrink-0 p-4 border-b border-[#FFD700]/20 bg-[#17212b]/50">
        <QuickFilters
          activeQuickFilter={activeQuickFilter}
          onQuickFilterChange={setActiveQuickFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
          onFiltersSubmit={onFiltersSubmit}
          onClearFilters={clearFilters}
          totalCalls={totalCalls}
          missedCount={missedCount}
          register={register}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Основной контент: список + детали */}
      <div className="flex-1 flex overflow-hidden">
        {/* Список карточек */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          isPanelOpen ? "w-1/2 lg:w-2/5" : "w-full"
        )}>
          <CallsListView
            groupedCalls={filteredGroupedCalls}
            selectedPhone={selectedPhone}
            loading={loading}
            error={error}
            onSelectCall={handleSelectCall}
            onQuickPlay={handleQuickPlay}
            onQuickCreateOrder={handleQuickCreateOrder}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCalls={totalCalls}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        </div>

        {/* Боковая панель с деталями */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          isPanelOpen ? "w-1/2 lg:w-3/5" : "w-0"
        )}>
          <CallDetailPanel
            call={selectedCallData.call}
            callGroup={selectedCallData.group}
            isOpen={isPanelOpen}
            onClose={handleCloseDetailPanel}
            onCreateOrder={createOrderFromCall}
            onLoadOrderHistory={loadOrderHistory}
            onDownloadRecording={downloadRecording}
            onLoadRecording={(call) => {
              setStickyPlayerCall(call);
              loadRecording(call);
            }}
            playingCall={playingCall}
            currentAudioUrl={currentAudioUrl}
            onClosePlayer={handleCloseStickyPlayer}
            orderHistoryLoading={orderHistoryLoading}
          />
        </div>
      </div>

      {/* Sticky аудиоплеер внизу */}
      <StickyAudioPlayer
        call={stickyPlayerCall}
        audioUrl={currentAudioUrl}
        isVisible={isStickyPlayerVisible}
        onClose={handleCloseStickyPlayer}
        onDownload={downloadRecording}
      />

      {/* Отступ для sticky плеера */}
      {isStickyPlayerVisible && <div className="h-16" />}
    </div>
  );
};

TelephonyPageV2.displayName = 'TelephonyPageV2';
