import { useState } from 'react';
import authApi from '@/lib/auth';
import { toast } from 'sonner';
import { AvitoRating, ReviewsData, ShowAllReviews } from '@/types/avito';

export const useAvitoReviews = () => {
  const [ratingsInfo, setRatingsInfo] = useState<AvitoRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [selectedAccountReviews, setSelectedAccountReviews] = useState<ReviewsData | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [showAllReviews, setShowAllReviews] = useState<ShowAllReviews>({});

  const loadRatingsInfo = async () => {
    setLoadingRatings(true);
    try {
      const response = await authApi.get('/avito/ratings');
      setRatingsInfo(response.data.ratings || []);
    } catch (error: unknown) {
      console.error('Failed to load ratings info:', error);
      toast.error('Ошибка загрузки данных рейтингов', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при загрузке рейтингов.',
      });
    } finally {
      setLoadingRatings(false);
    }
  };

  const loadAccountReviews = async (accountId: number) => {
    setLoadingReviews(true);
    try {
      const response = await authApi.get(`/avito/${accountId}/reviews?offset=0&limit=50`);
      setSelectedAccountReviews(response.data);
      setReviews(response.data.reviews?.reviews || []);
    } catch (error: unknown) {
      console.error('Failed to load reviews:', error);
      toast.error('Ошибка загрузки отзывов', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при загрузке отзывов.',
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleViewAccountReviews = async (accountId: number) => {
    await loadAccountReviews(accountId);
    setShowAllReviews(prev => ({ ...prev, [accountId]: true }));
  };

  const clearReviews = () => {
    setShowAllReviews({});
    setSelectedAccountReviews(null);
    setReviews([]);
  };

  return {
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
    setShowAllReviews,
    loadRatingsInfo,
    loadAccountReviews,
    handleViewAccountReviews,
    clearReviews,
  };
};
