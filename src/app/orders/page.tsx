'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, AlertCircle } from 'lucide-react';
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

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

function OrdersContent() {
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

  // Показываем загрузку, пока не получены данные пользователя
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Ошибка при загрузке заказов</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-2 sm:py-4 px-2 sm:px-4 min-h-screen custom-scrollbar bg-[#F3F3EE] dark:bg-[#111827]">
        <div className="w-full">
          <div className="space-y-4 w-full">
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
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}


