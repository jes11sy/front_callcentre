import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThumbsUp, Loader2, Star } from 'lucide-react';
import { AvitoRating, ReviewsData, ShowAllReviews } from '@/types/avito';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratingsInfo: AvitoRating[];
  loadingRatings: boolean;
  selectedAccountReviews: ReviewsData | null;
  loadingReviews: boolean;
  reviews: unknown[];
  showAllReviews: ShowAllReviews;
  onViewAccountReviews: (accountId: number) => void;
}

export const ReviewsModal = ({
  isOpen,
  onClose,
  ratingsInfo,
  loadingRatings,
  selectedAccountReviews,
  loadingReviews,
  reviews,
  showAllReviews,
  onViewAccountReviews,
}: ReviewsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <ThumbsUp className="mr-3 h-5 w-5 text-indigo-600" />
            Отзывы и рейтинги аккаунтов
          </DialogTitle>
          <DialogDescription>
            Просмотр рейтингов и отзывов для всех аккаунтов Avito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingRatings ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Загрузка рейтингов...</h3>
            </div>
          ) : ratingsInfo.length === 0 ? (
            <div className="text-center py-8">
              <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет данных о рейтингах</h3>
              <p className="mt-1 text-sm text-gray-500">
                Убедитесь, что аккаунты настроены правильно
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratingsInfo.map((account) => (
                <div key={account.accountId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-2">{account.accountName}</div>
                      
                      {account.error ? (
                        <div className="text-red-600 text-sm">
                          ❌ Ошибка: {account.error}
                        </div>
                      ) : account.ratingInfo ? (
                        <div className="space-y-2">
                          {account.ratingInfo.isEnabled ? (
                            account.ratingInfo.rating ? (
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="font-medium text-lg">
                                    {account.ratingInfo.rating.score?.toFixed(1) || 'N/A'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Отзывов: {account.ratingInfo.rating.reviewsCount || 0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Влияют на рейтинг: {account.ratingInfo.rating.reviewsWithScoreCount || 0}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-600 text-sm">
                                Рейтинг включен, но данных пока нет
                              </div>
                            )
                          ) : (
                            <div className="text-gray-600 text-sm">
                              ⚪ Рейтинг отключен
                            </div>
                          )}

                          {showAllReviews[account.accountId] && selectedAccountReviews?.accountId === account.accountId && (
                            <div className="mt-4 border-t pt-4">
                              <h4 className="font-medium mb-3">Отзывы:</h4>
                              {loadingReviews ? (
                                <div className="text-center py-4">
                                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
                                  <p className="text-sm text-gray-500 mt-2">Загрузка отзывов...</p>
                                </div>
                              ) : reviews.length === 0 ? (
                                <p className="text-gray-500 text-sm">Отзывов пока нет</p>
                              ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {reviews.map((review: unknown, _index: number) => {
                                    const reviewData = review as { id: string; score: number; sender?: { name?: string }; createdAt: number; text: string; item?: { title: string }; stage: string; usedInScore: boolean; answer?: { text: string; status: string } };
                                    return (
                                    <div key={reviewData.id} className="bg-white border rounded p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <Star 
                                                key={star}
                                                className={`h-3 w-3 ${
                                                  star <= reviewData.score 
                                                    ? 'text-yellow-400 fill-current' 
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-sm font-medium">
                                            {reviewData.sender?.name || 'Аноним'}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Date(reviewData.createdAt * 1000).toLocaleDateString('ru-RU')}
                                        </span>
                                      </div>
                                      
                                      <p className="text-sm text-gray-700 mb-2">{reviewData.text}</p>
                                      
                                      {reviewData.item && (
                                        <p className="text-xs text-gray-500 mb-2">
                                          Объявление: {reviewData.item.title}
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center justify-between">
                                        <Badge 
                                          variant={reviewData.stage === 'done' ? 'default' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {reviewData.stage === 'done' && '✅ Сделка состоялась'}
                                          {reviewData.stage === 'fell_through' && '❌ Сделка сорвалась'}
                                          {reviewData.stage === 'not_agree' && '⚪ Не договорились'}
                                          {reviewData.stage === 'not_communicate' && '⚫ Не общались'}
                                        </Badge>
                                        
                                        {reviewData.usedInScore && (
                                          <Badge variant="outline" className="text-xs">
                                            Учитывается в рейтинге
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {reviewData.answer && (
                                        <div className="mt-2 pl-4 border-l-2 border-blue-200 bg-blue-50 p-2 rounded">
                                          <p className="text-sm font-medium text-blue-800">Ваш ответ:</p>
                                          <p className="text-sm text-blue-700">{reviewData.answer.text}</p>
                                          <Badge 
                                            variant={reviewData.answer.status === 'published' ? 'default' : 'secondary'}
                                            className="text-xs mt-1"
                                          >
                                            {reviewData.answer.status === 'published' && '✅ Опубликован'}
                                            {reviewData.answer.status === 'moderation' && '⏳ На модерации'}
                                            {reviewData.answer.status === 'rejected' && '❌ Отклонен'}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          Нет данных о рейтинге
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {account.ratingInfo?.isEnabled && account.ratingInfo?.rating?.reviewsCount && account.ratingInfo.rating.reviewsCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewAccountReviews(account.accountId)}
                          disabled={loadingReviews && selectedAccountReviews?.accountId === account.accountId}
                          className="min-w-[120px]"
                        >
                          {showAllReviews[account.accountId] && selectedAccountReviews?.accountId === account.accountId ? (
                            loadingReviews ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Скрыть отзывы'
                            )
                          ) : (
                            'Посмотреть отзывы'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
