'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import authApi from '@/lib/auth';
import { useAvitoAccounts } from '@/hooks/useAvitoAccounts';
import { useAvitoModals } from '@/hooks/useAvitoModals';
import { useAvitoProxyCheck } from '@/hooks/useAvitoProxyCheck';
import { useAvitoEternalOnline } from '@/hooks/useAvitoEternalOnline';
import { useAvitoReviews } from '@/hooks/useAvitoReviews';
import { AvitoFormData } from '@/types/avito';
import { AvitoStatsCards } from '@/components/admin/avito/AvitoStatsCards';
import { AvitoToolsSection } from '@/components/admin/avito/AvitoToolsSection';
import { AvitoAccountsTable } from '@/components/admin/avito/AvitoAccountsTable';
import { AvitoAccountForm } from '@/components/admin/avito/AvitoAccountForm';
import { ProxyCheckModal } from '@/components/admin/avito/ProxyCheckModal';
import { EternalOnlineModal } from '@/components/admin/avito/EternalOnlineModal';
import { ReviewsModal } from '@/components/admin/avito/ReviewsModal';
import { DeleteAccountDialog } from '@/components/admin/avito/DeleteAccountDialog';
import { AvitoAccount } from '@/types/avito';


export default function AdminAvitoPage() {
  // Основные хуки для управления аккаунтами
  const {
    accounts,
    loading,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    testingConnection: _testingConnection,
    syncingAccount,
    syncingAll,
    testingProxy,
    filteredAccounts,
    stats,
    createForm,
    editForm,
    fetchAccounts: _fetchAccounts,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleTestConnection: _handleTestConnection,
    handleSyncAccount,
    handleSyncAllAccounts,
    handleTestProxy,
    handleRegisterWebhook,
  } = useAvitoAccounts();

  // Хуки для модальных окон
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isProxyCheckModalOpen,
    isEternalOnlineModalOpen,
    isReviewsModalOpen,
    selectedAccount,
    setSelectedAccount,
    showClientSecret,
    showProxyPassword,
    showProxyPasswords,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openProxyCheckModal,
    closeProxyCheckModal,
    openEternalOnlineModal,
    closeEternalOnlineModal,
    openReviewsModal,
    closeReviewsModal,
    toggleClientSecretVisibility,
    toggleProxyPasswordVisibility,
    toggleProxyPasswordVisibilityForAccount,
    toggleShowAllReviews: _toggleShowAllReviews,
  } = useAvitoModals();

  // Хуки для проверки прокси
  const {
    proxyCheckResults,
    setProxyCheckResults: _setProxyCheckResults,
    checkingProxyIds,
    setCheckingProxyIds: _setCheckingProxyIds,
    proxyAccounts,
    setProxyAccounts: _setProxyAccounts,
    loadingProxyData,
    setLoadingProxyData: _setLoadingProxyData,
    loadProxyData,
    handleCheckSingleProxy,
    clearResults,
  } = useAvitoProxyCheck();

  // Хуки для вечного онлайна
  const {
    onlineStatuses,
    setOnlineStatuses: _setOnlineStatuses,
    eternalOnlineSettings,
    setEternalOnlineSettings: _setEternalOnlineSettings,
    updatingOnlineStatus,
    setUpdatingOnlineStatus: _setUpdatingOnlineStatus,
    loadOnlineStatuses,
    handleToggleEternalOnline,
  } = useAvitoEternalOnline();

  // Хуки для отзывов
  const {
    ratingsInfo,
    setRatingsInfo: _setRatingsInfo,
    loadingRatings,
    setLoadingRatings: _setLoadingRatings,
    selectedAccountReviews,
    setSelectedAccountReviews: _setSelectedAccountReviews,
    loadingReviews,
    setLoadingReviews: _setLoadingReviews,
    reviews,
    setReviews: _setReviews,
    showAllReviews,
    setShowAllReviews: _setShowAllReviews,
    loadRatingsInfo,
    loadAccountReviews: _loadAccountReviews,
    handleViewAccountReviews,
    clearReviews: _clearReviews,
  } = useAvitoReviews();

  // Обработчики событий
  const handleCreateAccountSubmit = async (data: unknown) => {
    const success = await handleCreateAccount(data as AvitoFormData);
    if (success) {
      closeCreateModal();
    }
    return success;
  };

  const handleEditAccountSubmit = async (data: unknown) => {
    if (!selectedAccount) return false;
    const success = await handleEditAccount(data as AvitoFormData, selectedAccount.id);
    if (success) {
      closeEditModal();
    }
    return success;
  };

  const handleDeleteAccountConfirm = async () => {
    if (!selectedAccount) return;
    const success = await handleDeleteAccount(selectedAccount.id);
    if (success) {
      closeDeleteModal();
    }
  };

  const handleEditAccountClick = async (account: AvitoAccount) => {
    setSelectedAccount(account);
    // Fetch full account details including secrets
    try {
      const response = await authApi.get(`/avito/${account.id}`);
      const fullAccount = response.data.account;
      editForm.reset({
        name: fullAccount.name,
        clientId: fullAccount.clientId,
        clientSecret: fullAccount.clientSecret,
        userId: fullAccount.userId || '',
        proxyType: fullAccount.proxyType || undefined,
        proxyHost: fullAccount.proxyHost || '',
        proxyPort: fullAccount.proxyPort ? String(fullAccount.proxyPort) : '',
        proxyLogin: fullAccount.proxyLogin || '',
        proxyPassword: fullAccount.proxyPassword || '',
      });
      openEditModal(account);
    } catch {
      toast.error('Ошибка загрузки данных аккаунта');
    }
  };

  const handleOpenProxyCheckModalClick = async () => {
    openProxyCheckModal();
    await loadProxyData();
  };

  const handleOpenEternalOnlineModalClick = async () => {
    openEternalOnlineModal();
    await loadOnlineStatuses(accounts);
  };

  const handleOpenReviewsModalClick = async () => {
    openReviewsModal();
    await loadRatingsInfo();
  };

  return (
    <DashboardLayout variant="admin" requiredRole="admin">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление Avito</h1>
            <p className="text-gray-600 mt-1">Управление аккаунтами и интеграцией с Avito API</p>
          </div>
          <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> 
                Добавить аккаунт
              </Button>
          </div>

        {/* Stats Cards */}
        <AvitoStatsCards stats={stats} />

        {/* Tools Section */}
        <AvitoToolsSection 
          accountsCount={accounts.length}
          onOpenProxyCheckModal={handleOpenProxyCheckModalClick}
          onOpenEternalOnlineModal={handleOpenEternalOnlineModalClick}
          onOpenReviewsModal={handleOpenReviewsModalClick}
          onRegisterWebhook={handleRegisterWebhook}
        />

        {/* Main Content */}
        <AvitoAccountsTable
          accounts={filteredAccounts}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSyncAll={handleSyncAllAccounts}
          syncingAll={syncingAll}
          onEditAccount={handleEditAccountClick}
          onDeleteAccount={openDeleteModal}
          onSyncAccount={handleSyncAccount}
          syncingAccount={syncingAccount}
        />

        {/* Modals */}
        <AvitoAccountForm
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateAccountSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          form={createForm}
          showClientSecret={showClientSecret}
          onToggleClientSecret={toggleClientSecretVisibility}
          showProxyPassword={showProxyPassword}
          onToggleProxyPassword={toggleProxyPasswordVisibility}
        />

        <AvitoAccountForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditAccountSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
          form={editForm}
          showClientSecret={showClientSecret}
          onToggleClientSecret={toggleClientSecretVisibility}
          showProxyPassword={showProxyPassword}
          onToggleProxyPassword={toggleProxyPasswordVisibility}
          onTestProxy={handleTestProxy}
          testingProxy={testingProxy}
        />

        <DeleteAccountDialog
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          selectedAccount={selectedAccount}
          isSubmitting={isSubmitting}
          onConfirm={handleDeleteAccountConfirm}
        />

        <ProxyCheckModal
          isOpen={isProxyCheckModalOpen}
          onClose={closeProxyCheckModal}
          proxyAccounts={proxyAccounts}
          loadingProxyData={loadingProxyData}
          proxyCheckResults={proxyCheckResults}
          checkingProxyIds={checkingProxyIds}
          showProxyPasswords={showProxyPasswords}
          onCheckSingleProxy={handleCheckSingleProxy}
          onToggleProxyPasswordVisibility={toggleProxyPasswordVisibilityForAccount}
          onClearResults={clearResults}
        />

        <EternalOnlineModal
          isOpen={isEternalOnlineModalOpen}
          onClose={closeEternalOnlineModal}
          accounts={accounts}
          onlineStatuses={onlineStatuses}
          eternalOnlineSettings={eternalOnlineSettings}
          updatingOnlineStatus={updatingOnlineStatus}
          onToggleEternalOnline={handleToggleEternalOnline}
        />

        <ReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={closeReviewsModal}
          ratingsInfo={ratingsInfo}
          loadingRatings={loadingRatings}
          selectedAccountReviews={selectedAccountReviews}
          loadingReviews={loadingReviews}
          reviews={reviews}
          showAllReviews={showAllReviews}
          onViewAccountReviews={handleViewAccountReviews}
        />

      </div>
    </DashboardLayout>
  );
}
