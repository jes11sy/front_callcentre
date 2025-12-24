import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Penalty } from '@/components/penalties/PenaltiesTable';
import { ordersApi, cashApi } from '@/lib/api-client';

export const usePenalties = () => {
  const { user } = useAuthStore();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Загрузка штрафов и городов
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Загружаем штрафы из cash с payment_purpose = 'Штраф'
        const penaltiesResponse = await cashApi.getCashTransactions({
          name: 'приход',
        });
        
        // Загружаем уникальные города из заказов
        const filterOptions = await ordersApi.getFilterOptions();
        
        // Извлекаем уникальные города из заказов
        const ordersResponse = await ordersApi.getOrders();
        const uniqueCities = Array.from(
          new Set(
            (ordersResponse.data?.orders || [])
              .map((order: any) => order.city)
              .filter((city: string) => city)
          )
        ).sort();
        
        setCities(uniqueCities);
        
        // Фильтруем только штрафы (где paymentPurpose = 'Штраф')
        const penaltyData = (penaltiesResponse.data?.items || penaltiesResponse.data || [])
          .filter((item: any) => item.paymentPurpose === 'Штраф')
          .map((item: any) => ({
            id: item.id,
            city: item.city,
            note: item.note || '',
            amount: Math.abs(item.amount),
            dateCreate: item.dateCreate,
            nameCreate: item.nameCreate,
          }));
        
        setPenalties(penaltyData);
      } catch (err) {
        console.error('Error loading penalties:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки штрафов');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEditPenalty = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsEditModalOpen(true);
  };

  const handleDeletePenalty = async (id: number) => {
    try {
      await cashApi.deleteCashTransaction(id.toString());
      setPenalties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting penalty:', err);
      alert('Ошибка при удалении штрафа');
    }
  };

  const handleSavePenalty = async (
    id: number,
    data: { city: string; reason: string; amount: number; orderNumber?: string }
  ) => {
    try {
      // Формируем note из причины и номера заказа
      const note = data.orderNumber 
        ? `${data.reason} заказ ${data.orderNumber}`
        : data.reason;
      
      await cashApi.updateCashTransaction(id.toString(), {
        city: data.city,
        note: note,
        amount: Math.abs(data.amount), // Положительная сумма
        paymentPurpose: 'Штраф',
      });
      
      // Обновляем локальное состояние
      setPenalties(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, city: data.city, note: note, amount: data.amount }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating penalty:', err);
      throw err;
    }
  };

  const handleCreatePenalty = async (data: {
    city: string;
    reason: string;
    amount: number;
    orderNumber?: string;
  }) => {
    try {
      // Формируем note из причины и номера заказа
      const note = data.orderNumber 
        ? `${data.reason} заказ ${data.orderNumber}`
        : data.reason;
      
      const response = await cashApi.createCashTransaction({
        city: data.city,
        note: note,
        amount: Math.abs(data.amount), // Положительная сумма
        name: 'приход',
        paymentPurpose: 'Штраф',
        nameCreate: user?.name || user?.login || 'Неизвестно',
        dateCreate: new Date().toISOString(),
      });
      
      // Добавляем в локальное состояние
      if (response.data) {
        const newPenalty: Penalty = {
          id: response.data.id,
          city: data.city,
          note: note,
          amount: data.amount,
          dateCreate: response.data.dateCreate || new Date().toISOString(),
          nameCreate: user?.name || user?.login,
        };
        setPenalties(prev => [newPenalty, ...prev]);
      }
    } catch (err) {
      console.error('Error creating penalty:', err);
      throw err;
    }
  };

  return {
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
  };
};

