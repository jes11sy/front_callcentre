'use client';

import { Suspense } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, AlertCircle } from 'lucide-react';
import { PenaltiesTable } from '@/components/penalties/PenaltiesTable';
import { CreatePenaltyModal } from '@/components/penalties/CreatePenaltyModal';
import { EditPenaltyModal } from '@/components/penalties/EditPenaltyModal';
import { usePenalties } from '@/hooks/usePenalties';

function PenaltiesContent() {
  const {
    penalties,
    isLoading,
    error,
    user,
    selectedPenalty,
    isCreateModalOpen,
    isEditModalOpen,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    handleEditPenalty,
    handleDeletePenalty,
    handleSavePenalty,
    handleCreatePenalty,
    setSelectedPenalty,
  } = usePenalties();

  // Показываем загрузку, пока не получены данные пользователя
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FFD700]" />
          <p className="text-gray-400">Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">Ошибка при загрузке штрафов</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout variant={user?.role === 'admin' ? 'admin' : 'operator'}>
      <div className="w-full py-4 px-4 bg-[#0f0f23] min-h-screen custom-scrollbar">
        <div className="w-full">
          <div className="space-y-4 w-full">
            {/* Penalties Table */}
            <PenaltiesTable
              penalties={penalties}
              isLoading={isLoading}
              onEditPenalty={handleEditPenalty}
              onDeletePenalty={handleDeletePenalty}
              onCreatePenalty={() => setIsCreateModalOpen(true)}
            />

            {/* Create Modal */}
            <CreatePenaltyModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreatePenalty}
            />

            {/* Edit Modal */}
            <EditPenaltyModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedPenalty(null);
              }}
              penalty={selectedPenalty}
              onSave={handleSavePenalty}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PenaltiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#0f0f23]"><Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" /></div>}>
      <PenaltiesContent />
    </Suspense>
  );
}

