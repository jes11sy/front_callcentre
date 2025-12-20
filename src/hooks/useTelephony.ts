'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Call } from '@/types/telephony';
import { useCallsData } from './useCallsData';
import { useCallsFilters } from './useCallsFilters';
import { useCallsActions } from './useCallsActions';
import { useGlobalSocket } from './useGlobalSocket';
import { useSocketCalls } from './useSocketCalls';

export const useTelephony = () => {
  // Socket - используем on/off из useGlobalSocket для подписки через SocketManager
  const { on, off, isConnected } = useGlobalSocket();
  
  // Разделенные хуки
  const callsData = useCallsData();
  const filters = useCallsFilters();
  const actions = useCallsActions();
  
  // Socket events - передаём on/off вместо socket
  useSocketCalls({
    on,
    off,
    isConnected,
    onNewCall: callsData.handleNewCall,
    onUpdatedCall: callsData.handleUpdatedCall,
    onEndedCall: callsData.handleEndedCall
  });

  // Локальные состояния для группировки
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Мемоизированная группировка звонков с оптимизацией и лимитом на количество групп
  const groupedCalls = useMemo(() => {
    if (!callsData.calls.length) return {};
    
    const groups = callsData.calls.reduce((groups, call) => {
      const key = call.phoneClient;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(call);
      return groups;
    }, {} as Record<string, Call[]>);

    // Сортировка звонков в каждой группе по дате
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.dateCreate).getTime() - new Date(a.dateCreate).getTime());
    });

    // Ограничиваем количество групп до 20
    const limitedGroups: Record<string, Call[]> = {};
    const groupKeys = Object.keys(groups).slice(0, 20);
    groupKeys.forEach(key => {
      limitedGroups[key] = groups[key];
    });

    return limitedGroups;
  }, [callsData.calls]);

  // Мемоизированные функции
  const toggleGroup = useCallback((phoneClient: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(phoneClient)) {
        newExpanded.delete(phoneClient);
      } else {
        newExpanded.add(phoneClient);
      }
      return newExpanded;
    });
  }, []);

  const handleManualRefresh = useCallback(() => {
    filters.setCurrentPage(1);
    callsData.fetchCalls(filters.apiParams);
  }, [filters]);

  // Начальная загрузка данных
  useEffect(() => {
    // Принудительно загружаем данные с базовыми параметрами
    // Увеличиваем лимит до 200, т.к. звонки группируются и нужно больше данных для отображения достаточного количества групп
    const basicParams = new URLSearchParams({
      page: '1',
      limit: '200',
      sortBy: 'dateCreate',
      sortOrder: 'desc'
    });
    
    callsData.fetchCalls(basicParams);
  }, []); // Загружаем только при монтировании

  // Флаг для предотвращения повторных запросов
  const [isInitialized, setIsInitialized] = useState(false);

  // Обновление данных при изменении фильтров
  useEffect(() => {
    if (filters.stableApiParams && isInitialized) {
      const params = new URLSearchParams(filters.stableApiParams);
      callsData.fetchCalls(params);
    }
  }, [filters.stableApiParams, isInitialized]); // Используем стабилизированные параметры

  // Устанавливаем флаг инициализации после первой загрузки
  useEffect(() => {
    if (callsData.calls.length > 0 && !isInitialized) {
      setIsInitialized(true);
    }
  }, [callsData.calls.length, isInitialized]);

  // Обновление totalCalls и totalPages в фильтрах
  useEffect(() => {
    filters.setTotalCalls(callsData.totalCalls);
    filters.setTotalPages(callsData.totalPages);
  }, [callsData.totalCalls, callsData.totalPages, filters]);


  return {
    // States из callsData
    calls: callsData.calls,
    loading: callsData.loading,
    error: callsData.error,
    totalCalls: callsData.totalCalls,
    newCallsCount: callsData.newCallsCount,
    socketConnected: callsData.socketConnected,
    
    // States из filters
    searchTerm: filters.searchTerm,
    currentPage: filters.currentPage,
    totalPages: filters.totalPages,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    showFilters: filters.showFilters,
    
    // States из actions
    playingCall: actions.playingCall,
    currentAudioUrl: actions.currentAudioUrl,
    selectedCallForOrder: actions.selectedCallForOrder,
    selectedCallGroup: actions.selectedCallGroup,
    showCreateOrderModal: actions.showCreateOrderModal,
    showOrderHistoryModal: actions.showOrderHistoryModal,
    selectedCallForHistory: actions.selectedCallForHistory,
    orderHistory: actions.orderHistory,
    orderHistoryLoading: actions.orderHistoryLoading,
    
    // Локальные states
    expandedGroups,
    groupedCalls,
    
    // Form из filters
    register: filters.register,
    handleSubmit: filters.handleSubmit,
    errors: filters.errors,
    
    // Functions
    setSearchTerm: filters.setSearchTerm,
    setShowFilters: filters.setShowFilters,
    setCurrentPage: filters.setCurrentPage,
    setLimit: filters.setLimit,
    setShowCreateOrderModal: actions.setShowCreateOrderModal,
    setShowOrderHistoryModal: actions.setShowOrderHistoryModal,
    onFiltersSubmit: filters.onFiltersSubmit,
    clearFilters: filters.clearFilters,
    handleSearch: filters.handleSearch,
    handleSort: filters.handleSort,
    toggleGroup,
    handleManualRefresh,
    loadOrderHistory: actions.loadOrderHistory,
    loadRecording: actions.loadRecording,
    closePlayer: actions.closePlayer,
    downloadRecording: actions.downloadRecording,
    createOrderFromCall: actions.createOrderFromCall,
    handleOrderCreated: actions.handleOrderCreated,
    resetNewCallsCount: callsData.resetNewCallsCount
  };
};
