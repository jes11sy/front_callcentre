import { useState } from 'react';
import { AvitoAccount, ProxyCheckResult, OnlineStatuses, EternalOnlineSettings, ShowAllReviews, AvitoRating, ReviewsData } from '@/types/avito';

export const useAvitoModals = () => {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProxyCheckModalOpen, setIsProxyCheckModalOpen] = useState(false);
  const [isEternalOnlineModalOpen, setIsEternalOnlineModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // Selected account for edit/delete operations
  const [selectedAccount, setSelectedAccount] = useState<AvitoAccount | null>(null);

  // Password visibility states
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showProxyPassword, setShowProxyPassword] = useState(false);

  // Proxy check states
  const [proxyCheckResults, setProxyCheckResults] = useState<ProxyCheckResult>({});
  const [checkingProxyIds, setCheckingProxyIds] = useState<Set<number>>(new Set());
  const [showProxyPasswords, setShowProxyPasswords] = useState<Set<number>>(new Set());
  const [proxyAccounts, setProxyAccounts] = useState<AvitoAccount[]>([]);
  const [loadingProxyData, setLoadingProxyData] = useState(false);

  // Eternal online states
  const [onlineStatuses, setOnlineStatuses] = useState<OnlineStatuses>({});
  const [eternalOnlineSettings, setEternalOnlineSettings] = useState<EternalOnlineSettings>({});
  const [updatingOnlineStatus, setUpdatingOnlineStatus] = useState<Set<number>>(new Set());

  // Reviews states
  const [ratingsInfo, setRatingsInfo] = useState<AvitoRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [selectedAccountReviews, setSelectedAccountReviews] = useState<ReviewsData | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [showAllReviews, setShowAllReviews] = useState<ShowAllReviews>({});

  // Modal control functions
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (account: AvitoAccount) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAccount(null);
  };

  const openDeleteModal = (account: AvitoAccount) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccount(null);
  };

  const openProxyCheckModal = () => {
    setIsProxyCheckModalOpen(true);
  };

  const closeProxyCheckModal = () => {
    setIsProxyCheckModalOpen(false);
    setProxyCheckResults({});
    setCheckingProxyIds(new Set());
    setShowProxyPasswords(new Set());
  };

  const openEternalOnlineModal = () => {
    setIsEternalOnlineModalOpen(true);
  };

  const closeEternalOnlineModal = () => {
    setIsEternalOnlineModalOpen(false);
  };

  const openReviewsModal = () => {
    setIsReviewsModalOpen(true);
  };

  const closeReviewsModal = () => {
    setIsReviewsModalOpen(false);
    setShowAllReviews({});
    setSelectedAccountReviews(null);
    setReviews([]);
  };

  // Password visibility toggles
  const toggleClientSecretVisibility = () => {
    setShowClientSecret(!showClientSecret);
  };

  const toggleProxyPasswordVisibility = () => {
    setShowProxyPassword(!showProxyPassword);
  };

  const toggleProxyPasswordVisibilityForAccount = (accountId: number) => {
    setShowProxyPasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  // Reviews visibility toggle
  const toggleShowAllReviews = (accountId: number) => {
    setShowAllReviews(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  return {
    // Modal states
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isProxyCheckModalOpen,
    isEternalOnlineModalOpen,
    isReviewsModalOpen,
    
    // Selected account
    selectedAccount,
    setSelectedAccount,
    
    // Password visibility
    showClientSecret,
    showProxyPassword,
    showProxyPasswords,
    
    // Proxy check states
    proxyCheckResults,
    setProxyCheckResults,
    checkingProxyIds,
    setCheckingProxyIds,
    proxyAccounts,
    setProxyAccounts,
    loadingProxyData,
    setLoadingProxyData,
    
    // Eternal online states
    onlineStatuses,
    setOnlineStatuses,
    eternalOnlineSettings,
    setEternalOnlineSettings,
    updatingOnlineStatus,
    setUpdatingOnlineStatus,
    
    // Reviews states
    ratingsInfo,
    setRatingsInfo,
    loadingRatings,
    setLoadingRatings,
    selectedAccountReviews,
    setSelectedAccountReviews,
    loadingReviews,
    setLoadingReviews,
    reviews,
    setReviews,
    showAllReviews,
    
    // Modal control functions
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
    
    // Password visibility toggles
    toggleClientSecretVisibility,
    toggleProxyPasswordVisibility,
    toggleProxyPasswordVisibilityForAccount,
    
    // Reviews visibility toggle
    toggleShowAllReviews,
  };
};
