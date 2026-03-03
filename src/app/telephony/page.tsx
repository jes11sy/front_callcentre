'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTelephony } from '@/hooks/useTelephony';
import { TelephonyPageSkeleton } from '@/components/telephony/TelephonyPageSkeleton';
import nextDynamic from 'next/dynamic';

// Force dynamic rendering to avoid SSG issues with React Query
export const dynamic = 'force-dynamic';

// Динамические импорты для тяжелых компонентов (без fallback'ов)
const CreateOrderModal = nextDynamic(() => import('@/components/telephony/CreateOrderModal').then(mod => ({ default: mod.CreateOrderModal })), {
  ssr: false
});

const CreateAppealModal = nextDynamic(() => import('@/components/appeals/CreateAppealModal').then(mod => ({ default: mod.CreateAppealModal })), {
  ssr: false
});

// Новый интерфейс v4 - улучшенная таблица
const CallTableV4 = nextDynamic(() => import('@/components/telephony/v4/CallTableV4').then(mod => ({ default: mod.CallTableV4 })), {
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
    handleOrderCreated,
    answeredCallForOrder,
    clearAnsweredCallForOrder
  } = useTelephony();

  const appealCallContext = useMemo(() => {
    if (!answeredCallForOrder) return null;
    return {
      phone: answeredCallForOrder.phoneClient,
      callId: answeredCallForOrder.id,
      cityId: answeredCallForOrder.cityId,
      rkId: answeredCallForOrder.rkId,
      source: answeredCallForOrder.source ?? answeredCallForOrder.phone?.source,
      cityName: answeredCallForOrder.cityName ?? answeredCallForOrder.city?.name,
      rkName: answeredCallForOrder.rkName ?? answeredCallForOrder.rk?.name,
    };
  }, [answeredCallForOrder]);

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
      <div className="w-full py-2 sm:py-4 px-2 sm:px-4 min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
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

      {/* Auto Appeal Modal — opens when operator answers an inbound call */}
      <CreateAppealModal
        open={!!answeredCallForOrder}
        onOpenChange={(open) => { if (!open) clearAnsweredCallForOrder(); }}
        callContext={appealCallContext}
        onSaved={() => clearAnsweredCallForOrder()}
      />
    </DashboardLayout>
  );
}
