'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// LoadingSpinner removed - not used
import { useTelephony } from '@/hooks/useTelephony';
import { TelephonyPageSkeleton } from '@/components/telephony/TelephonyPageSkeleton';
import dynamic from 'next/dynamic';

// Динамические импорты для тяжелых компонентов (без fallback'ов)
const CreateOrderModal = dynamic(() => import('@/components/telephony/CreateOrderModal').then(mod => ({ default: mod.CreateOrderModal })), {
  ssr: false
});

const TelephonyHeader = dynamic(() => import('@/components/telephony/TelephonyHeader').then(mod => ({ default: mod.TelephonyHeader })), {
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
    searchTerm,
    currentPage,
    totalPages,
    totalCalls,
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
    newCallsCount,
    expandedGroups,
    socketConnected: _socketConnected,
    groupedCalls,
    
    // Form
    register,
    handleSubmit,
    errors,
    
    // Functions
    setSearchTerm,
    setShowFilters,
    setCurrentPage,
    setShowCreateOrderModal,
    setShowOrderHistoryModal,
    onFiltersSubmit,
    clearFilters,
    handleSearch,
    handleSort,
    toggleGroup,
    handleManualRefresh,
    loadOrderHistory,
    loadRecording,
    closePlayer,
    downloadRecording,
    createOrderFromCall,
    handleOrderCreated,
    resetNewCallsCount
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
        {/* Header */}
        <TelephonyHeader
          newCallsCount={newCallsCount}
          onNewCallsCountReset={resetNewCallsCount}
          onManualRefresh={handleManualRefresh}
          loading={loading}
        />

        {/* Calls Table с встроенными фильтрами */}
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
          groupedCallsCount={Object.keys(groupedCalls).length}
          totalCalls={totalCalls}
          filtersComponent={
            <TelephonyFilters
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSearch}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="w-full border-2 border-[#FFD700]/30 bg-[#17212b]">
            <CardContent className="p-4">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={i === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          disabled={loading}
                          className={
                            i === currentPage
                              ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                              : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          }
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
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
      </div>
    </DashboardLayout>
  );
}
