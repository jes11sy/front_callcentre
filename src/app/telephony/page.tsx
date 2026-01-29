'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTelephony } from '@/hooks/useTelephony';
import { TelephonyPageSkeleton } from '@/components/telephony/TelephonyPageSkeleton';
import dynamic from 'next/dynamic';

// Динамические импорты для тяжелых компонентов (без fallback'ов)
const CreateOrderModal = dynamic(() => import('@/components/telephony/CreateOrderModal').then(mod => ({ default: mod.CreateOrderModal })), {
  ssr: false
});

// Новый интерфейс v4 - улучшенная таблица
const CallTableV4 = dynamic(() => import('@/components/telephony/v4/CallTableV4').then(mod => ({ default: mod.CallTableV4 })), {
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
    stats,
    limit,
    sortBy,
    sortOrder,
    playingCall,
    currentAudioUrl,
    selectedCallForOrder,
    selectedCallGroup,
    showCreateOrderModal,
    orderHistoryLoading,
    expandedGroups,
    groupedCalls,
    
    // Functions
    setCurrentPage,
    setLimit,
    setShowCreateOrderModal,
    handleSort,
    toggleGroup,
    loadOrderHistory,
    loadRecording,
    closePlayer,
    downloadRecording,
    createOrderFromCall,
    handleOrderCreated
  } = useTelephony();

  // Показываем скелетон при загрузке (только для первой загрузки)
  if (loading && calls.length === 0) {
    return (
      <DashboardLayout variant="operator">
        <TelephonyPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout variant="operator">
      <div className="w-full py-4 px-4 bg-[#0f0f23] min-h-screen">
        <CallTableV4
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
          stats={stats}
        />
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        call={selectedCallForOrder}
        callGroup={selectedCallGroup}
        open={showCreateOrderModal}
        onOpenChange={setShowCreateOrderModal}
        onOrderCreated={handleOrderCreated}
      />
    </DashboardLayout>
  );
}
