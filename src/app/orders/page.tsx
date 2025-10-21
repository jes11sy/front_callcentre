'use client';

import { Suspense } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// useAuthStore removed - not used
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import CreateOrderModal from '@/components/orders/CreateOrderModal';
import { 
  OrdersFilters, 
  TimeSlotsTable, 
  OrdersTable, 
  OrderViewModal, 
  OrderEditModal 
} from '@/components/orders';
import { useOrders } from '@/hooks/useOrders';

function OrdersContent() {
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
    loadOrderCalls: _loadOrderCalls,
    setPage,
    setLimit,
    setSelectedOrder,
    setIsEditModalOpen,
    setIsViewModalOpen: _setIsViewModalOpen,
    setIsCreateModalOpen,
    setOrderCalls: _setOrderCalls
  } = useOrders();

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
    <DashboardLayout variant={user?.role === 'admin' ? 'admin' : 'operator'}>
      <div className="w-full py-6 px-4 bg-[#0f0f23] min-h-screen custom-scrollbar">
        <div className="w-full">
          <div className="space-y-6 w-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-end">
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать заказ
                </Button>
              </div>
            </div>

            {/* Filters */}
            <OrdersFilters 
              filters={filters}
              onFilterChange={updateFilter}
            />

            {/* Time Slots Table */}
            {ordersData?.orders && (
              <TimeSlotsTable orders={ordersData.orders} />
            )}

            {/* Orders Table */}
            <OrdersTable
              ordersData={ordersData}
              isLoading={isLoading}
              search={filters.search}
              limit={limit}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
              onCreateOrder={() => setIsCreateModalOpen(true)}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />

            {/* View Modal */}
            <OrderViewModal
              isOpen={isViewModalOpen}
              onClose={handleCloseViewModal}
              order={selectedOrder}
              orderCalls={orderCalls}
              loadingCalls={loadingCalls}
              loadRecording={() => {}}
              skipBackward={() => {}}
              skipForward={() => {}}
              seekTo={() => {}}
              setVolume={() => {}}
              formatDate={(date) => new Date(date).toLocaleString('ru-RU')}
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


