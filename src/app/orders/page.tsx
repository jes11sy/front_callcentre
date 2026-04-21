'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CreateOrderModal from '@/components/orders/CreateOrderModal';
import { 
  OrdersFilters, 
  TimeSlotsTable, 
  OrdersTable, 
  OrderViewModal, 
  OrderEditModal 
} from '@/components/orders';
import { useOrders } from '@/hooks/useOrders';
import { StickyAudioPlayer } from '@/components/telephony/v2/StickyAudioPlayer';
import { Call } from '@/types/orders';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

function OrdersContent() {
  const { theme } = useDesignStore();
  const { _hasHydrated, isLoading: isAuthLoading } = useAuthStore();
  const isDark = theme === 'dark';
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const openedRef = useRef(false);
  
  // Audio player state
  const [playingCall, setPlayingCall] = useState<Call | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  
  // Load recording function
  const loadRecording = useCallback(async (call: Call) => {
    try {
      setPlayingCall(call);
      
      const response = await api.get(`/recordings/call/${call.id}/download`, {
        responseType: 'json',
      });
      
      if (response.data.success && response.data.url) {
        setCurrentAudioUrl(response.data.url);
      } else {
        throw new Error(response.data.message || 'Не удалось получить URL записи');
      }
    } catch (error: unknown) {
      console.error('Error loading recording:', error);
      toast.error('Ошибка загрузки записи');
      setPlayingCall(null);
      setCurrentAudioUrl(null);
    }
  }, []);
  
  const closePlayer = useCallback(() => {
    setPlayingCall(null);
    setCurrentAudioUrl(null);
  }, []);
  
  const downloadRecording = useCallback(async (call: Call) => {
    try {
      const response = await api.get(`/recordings/call/${call.id}/download`);
      if (response.data.success && response.data.url) {
        const a = document.createElement('a');
        a.href = response.data.url;
        a.download = `call_${call.id}_recording.mp3`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Запись загружена');
      }
    } catch (error) {
      toast.error('Ошибка при загрузке записи');
    }
  }, []);
  
  const isStickyPlayerVisible = playingCall !== null && currentAudioUrl !== null;
  
  const {
    filters,
    page: _page,
    limit,
    selectedOrder,
    isEditModalOpen,
    isViewModalOpen,
    isCreateModalOpen,
    orderCalls,
    loadingCalls,
    ordersData,
    timelineOrders,
    timelineDate,
    isLoading,
    error,
    user,
    updateStatusMutation: _updateStatusMutation,
    updateOrderMutation,
    handleStatusChange: _handleStatusChange,
    handleSaveOrder,
    handleViewOrder,
    handleCloseViewModal,
    handleEditOrder,
    updateFilter,
    resetFilters,
    loadOrderCalls: _loadOrderCalls,
    setPage,
    setLimit,
    setSelectedOrder,
    setIsEditModalOpen,
    setIsViewModalOpen: _setIsViewModalOpen,
    setIsCreateModalOpen,
    setOrderCalls: _setOrderCalls,
    openOrderById,
    setTimelineDate
  } = useOrders();
  const hasNetworkError = Boolean(error);

  // Обработчик клика на город во временной шкале — передаёт cityId
  const handleCityClick = React.useCallback((cityId: string) => {
    updateFilter('cityId', cityId);
  }, [updateFilter]);

  // Открываем заказ по ID из URL (только один раз)
  useEffect(() => {
    if (orderIdFromUrl && !isLoading && !openedRef.current) {
      const orderId = parseInt(orderIdFromUrl);
      if (!isNaN(orderId)) {
        openedRef.current = true;
        openOrderById(orderId);
      }
    }
  }, [orderIdFromUrl, isLoading, openOrderById]);

  const shouldWaitForAuth = !_hasHydrated || (isAuthLoading && !user);
  const shouldShowInitialLoader = isLoading && !ordersData;

  if (shouldWaitForAuth) {
    return (
      <DashboardLayout>
        <LoadingScreen fullScreen />
      </DashboardLayout>
    );
  }

  if (shouldShowInitialLoader) {
    return (
      <DashboardLayout>
        <LoadingScreen fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen px-4 py-6 custom-scrollbar bg-[#f5f5f7] dark:bg-[#111113]">
        <div className="w-full">
          <div className="space-y-4 w-full">
            {hasNetworkError && (
              <div className={`rounded-[16px] border px-4 py-3 text-sm ${
                isDark
                  ? 'border-[#FEC004]/35 bg-[#FEC004]/10 text-[#ffe9a6]'
                  : 'border-[#FEC004]/45 bg-[#FFF7D6] text-[#8a6500]'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <span>Вы оффлайн или сервер недоступен. Интерфейс открыт, данные могут быть неактуальны.</span>
                  <button
                    onClick={() => window.location.reload()}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isDark
                        ? 'border-[#FEC004]/45 text-[#ffe9a6] hover:bg-[#FEC004]/15'
                        : 'border-[#FEC004]/55 text-[#8a6500] hover:bg-[#FEC004]/18'
                    }`}
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

            {/* Time Slots Table */}
            <TimeSlotsTable 
              orders={timelineOrders} 
              selectedDate={timelineDate}
              onDateChange={setTimelineDate}
              onCityClick={handleCityClick}
            />

            {/* Orders Table с встроенными фильтрами */}
            <OrdersTable
              ordersData={ordersData}
              isLoading={isLoading}
              search={filters.search}
              limit={limit}
              onViewOrder={handleViewOrder}
              onCreateOrder={() => setIsCreateModalOpen(true)}
              onPageChange={setPage}
              onLimitChange={setLimit}
              filtersComponent={
                <OrdersFilters 
                  filters={filters}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}

                />
              }
            />

            {/* View Modal */}
            <OrderViewModal
              isOpen={isViewModalOpen}
              onClose={() => {
                closePlayer();
                handleCloseViewModal();
              }}
              order={selectedOrder}
              orderCalls={orderCalls}
              loadingCalls={loadingCalls}
              loadRecording={loadRecording}
              formatDate={(date) => new Date(date).toLocaleString('ru-RU')}
              onEdit={() => {
                setIsEditModalOpen(true);
              }}
            />

            {/* Edit Modal */}
            <OrderEditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              order={selectedOrder}
              userRole={user?.role}
              onSave={handleSaveOrder}
              isSaving={updateOrderMutation.isPending}
              onOrderChange={setSelectedOrder}
            />

            {/* Create Modal */}
            <CreateOrderModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onOrderCreated={() => {
                setIsCreateModalOpen(false);
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Sticky Audio Player */}
      {isStickyPlayerVisible && playingCall && (
        <StickyAudioPlayer
          call={{
            id: playingCall.id,
            phoneClient: selectedOrder?.phone || 'Неизвестный номер',
            city: selectedOrder?.city || {},
            operator: { 
              id: selectedOrder?.operatorId || 0, 
              name: selectedOrder?.operator?.name || 'Оператор' 
            },
            recordingPath: playingCall.recordingPath || ''
          } as import('@/types/telephony').Call}
          audioUrl={currentAudioUrl}
          isVisible={isStickyPlayerVisible}
          onClose={closePlayer}
          onDownload={() => downloadRecording(playingCall)}
        />
      )}
      
      {/* Spacer for sticky player */}
      {isStickyPlayerVisible && <div className="h-20" />}
    </DashboardLayout>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={(
        <DashboardLayout>
          <LoadingScreen fullScreen />
        </DashboardLayout>
      )}
    >
      <OrdersContent />
    </Suspense>
  );
}


