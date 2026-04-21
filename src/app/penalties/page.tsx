'use client';

import { Suspense } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';
import { PenaltiesTable } from '@/components/penalties/PenaltiesTable';
import { CreatePenaltyModal } from '@/components/penalties/CreatePenaltyModal';
import { EditPenaltyModal } from '@/components/penalties/EditPenaltyModal';
import { usePenalties } from '@/hooks/usePenalties';
import { useDesignStore } from '@/store/designStore';
import { LoadingState } from '@/components/ui/loading-state';

function PenaltiesContent() {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

  const {
    penalties,
    cities,
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
  const hasNetworkError = Boolean(error);

  // Показываем загрузку, пока не получены данные пользователя
  if (isLoading && !user) {
    return (
      <DashboardLayout>
        <div className="w-full min-h-screen px-4 py-6 bg-[#f5f5f7] dark:bg-[#111113]">
          <LoadingState isDark={isDark} message="Загрузка данных пользователя..." fullPage />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-6 px-4 min-h-screen custom-scrollbar bg-[#f5f5f7] dark:bg-[#111113] font-myriad">
        <div className="w-full">
          <div className="space-y-4 w-full">
            {hasNetworkError && (
              <div className={`rounded-[16px] border px-4 py-3 text-sm ${
                isDark
                  ? 'border-red-400/40 bg-red-500/10 text-red-100'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <span>Вы оффлайн или сервер недоступен. Интерфейс открыт, данные могут быть неактуальны.</span>
                  <button
                    onClick={() => window.location.reload()}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isDark
                        ? 'border-white/20 text-white hover:bg-white/10'
                        : 'border-red-200 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

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
              cities={cities}
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
              cities={cities}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PenaltiesFallback() {
  return (
    <DashboardLayout>
      <div className="w-full min-h-screen px-4 py-6 bg-[#f5f5f7] dark:bg-[#111113]">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#FEC004] dark:text-white" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PenaltiesPage() {
  return (
    <Suspense fallback={<PenaltiesFallback />}>
      <PenaltiesContent />
    </Suspense>
  );
}

