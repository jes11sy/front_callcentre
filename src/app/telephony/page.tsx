'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// LoadingSpinner removed - not used
import { useTelephony } from '@/hooks/useTelephony';
import { TelephonyPageSkeleton } from '@/components/telephony/TelephonyPageSkeleton';
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


export default function TelephonyPage() {
  const router = useRouter();
  const { user } = useAuthStore();

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

  // Показываем скелетон при загрузке
  if (loading) {
    return (
      <DashboardLayout variant="operator">
        <TelephonyPageSkeleton />
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout variant="operator">
      <div className="w-full py-4 px-4 space-y-4 bg-[#0f0f23] min-h-screen">
        {/* Calls Table с встроенными фильтрами и пагинацией */}
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
      </div>
    </DashboardLayout>
  );
}
