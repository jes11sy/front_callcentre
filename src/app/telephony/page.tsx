'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTelephony } from '@/hooks/useTelephony';
import { TelephonyPageSkeleton } from '@/components/telephony/TelephonyPageSkeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';
import dynamic from 'next/dynamic';

// Динамические импорты для тяжелых компонентов (без fallback'ов)
const CreateOrderModal = dynamic(() => import('@/components/telephony/CreateOrderModal').then(mod => ({ default: mod.CreateOrderModal })), {
  ssr: false
});

const TelephonyFilters = dynamic(() => import('@/components/telephony/TelephonyFilters').then(mod => ({ default: mod.TelephonyFilters })), {
  ssr: false
});

const CallTable = dynamic(() => import('@/components/telephony/CallTable').then(mod => ({ default: mod.CallTable })), {
  ssr: false
});

const OrderHistoryModal = dynamic(() => import('@/components/telephony/OrderHistoryModal').then(mod => ({ default: mod.OrderHistoryModal })), {
  ssr: false
});

// Новый интерфейс v2
const TelephonyPageV2 = dynamic(() => import('@/components/telephony/v2/TelephonyPageV2').then(mod => ({ default: mod.TelephonyPageV2 })), {
  ssr: false
});


export default function TelephonyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Переключатель между старым и новым интерфейсом
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('telephony-view-mode') as 'table' | 'cards') || 'cards';
    }
    return 'cards';
  });

  // Сохраняем выбор в localStorage
  useEffect(() => {
    localStorage.setItem('telephony-view-mode', viewMode);
  }, [viewMode]);

  const {
    // States
    calls,
    loading,
    error,
    currentPage,
    totalPages,
    totalCalls,
    limit,
    sortBy,
    sortOrder,
    showFilters,
    playingCall,
    currentAudioUrl,
    selectedCallForOrder,
    selectedCallGroup,
    showCreateOrderModal,
    showOrderHistoryModal,
    selectedCallForHistory,
    orderHistory,
    orderHistoryLoading,
    expandedGroups,
    socketConnected: _socketConnected,
    groupedCalls,
    
    // Form
    register,
    handleSubmit,
    errors,
    
    // Functions
    setShowFilters,
    setCurrentPage,
    setLimit,
    setShowCreateOrderModal,
    setShowOrderHistoryModal,
    onFiltersSubmit,
    clearFilters,
    handleSort,
    toggleGroup,
    loadOrderHistory,
    loadRecording,
    closePlayer,
    downloadRecording,
    createOrderFromCall,
    handleOrderCreated
  } = useTelephony();

  // Редирект админов на админскую страницу телефонии
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin/telephony');
      return;
    }
  }, [user, router]);

  // Не показываем контент для админов
  if (user && user.role === 'admin') {
    return null;
  }

  // Показываем скелетон при загрузке (только для первой загрузки)
  if (loading && calls.length === 0) {
    return (
      <DashboardLayout variant="operator">
        <TelephonyPageSkeleton />
      </DashboardLayout>
    );
  }

  // Переключатель вида
  const ViewToggle = () => (
    <div className="flex items-center gap-1 p-1 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('cards')}
        className={`h-8 px-3 ${viewMode === 'cards' ? 'bg-[#FFD700] text-[#0f0f23] hover:bg-[#FFD700]' : 'text-gray-400 hover:text-white'}`}
      >
        <LayoutGrid className="w-4 h-4 mr-1.5" />
        Карточки
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('table')}
        className={`h-8 px-3 ${viewMode === 'table' ? 'bg-[#FFD700] text-[#0f0f23] hover:bg-[#FFD700]' : 'text-gray-400 hover:text-white'}`}
      >
        <Table className="w-4 h-4 mr-1.5" />
        Таблица
      </Button>
    </div>
  );

  return (
    <DashboardLayout variant="operator">
      {/* Переключатель вида в правом верхнем углу */}
      <div className="absolute top-4 right-4 z-10">
        <ViewToggle />
      </div>

      {viewMode === 'cards' ? (
        // Новый интерфейс v2 - карточки с боковой панелью
        <TelephonyPageV2
          calls={calls}
          groupedCalls={groupedCalls}
          loading={loading}
          error={error}
          totalCalls={totalCalls}
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          sortBy={sortBy}
          sortOrder={sortOrder}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          setCurrentPage={setCurrentPage}
          setLimit={setLimit}
          onFiltersSubmit={onFiltersSubmit}
          clearFilters={clearFilters}
          handleSort={handleSort}
          loadRecording={loadRecording}
          closePlayer={closePlayer}
          downloadRecording={downloadRecording}
          createOrderFromCall={createOrderFromCall}
          loadOrderHistory={loadOrderHistory}
          playingCall={playingCall}
          currentAudioUrl={currentAudioUrl}
          orderHistoryLoading={orderHistoryLoading}
          setShowCreateOrderModal={setShowCreateOrderModal}
          setShowOrderHistoryModal={setShowOrderHistoryModal}
        />
      ) : (
        // Старый интерфейс - таблица
        <div className="w-full py-4 px-4 space-y-4 bg-[#0f0f23] min-h-screen">
          <CallTable
            calls={calls}
            groupedCalls={groupedCalls}
            expandedGroups={expandedGroups}
            loading={loading}
            error={error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            orderHistoryLoading={orderHistoryLoading}
            onToggleGroup={toggleGroup}
            onSort={handleSort}
            onCreateOrder={createOrderFromCall}
            onLoadOrderHistory={loadOrderHistory}
            onDownloadRecording={downloadRecording}
            onLoadRecording={loadRecording}
            playingCall={playingCall}
            currentAudioUrl={currentAudioUrl}
            onClosePlayer={closePlayer}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCalls={totalCalls}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
            filtersComponent={
              <TelephonyFilters
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSort}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onFiltersSubmit={onFiltersSubmit}
                onClearFilters={clearFilters}
                loading={loading}
                groupedCallsCount={Object.keys(groupedCalls).length}
                totalCalls={totalCalls}
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
              />
            }
          />
        </div>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        call={selectedCallForOrder}
        callGroup={selectedCallGroup}
        open={showCreateOrderModal}
        onOpenChange={setShowCreateOrderModal}
        onOrderCreated={handleOrderCreated}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        open={showOrderHistoryModal}
        onOpenChange={setShowOrderHistoryModal}
        selectedCall={selectedCallForHistory}
        orderHistory={orderHistory}
        orderHistoryLoading={orderHistoryLoading}
      />
    </DashboardLayout>
  );
}
