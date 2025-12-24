import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Penalty } from '@/components/penalties/PenaltiesTable';

// Mock data для демонстрации
const MOCK_PENALTIES: Penalty[] = [
  {
    id: 1,
    city: 'Казань',
    reason: 'Отмена из-за переноса',
    amount: 500,
    orderNumber: '12345',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    city: 'Самара',
    reason: 'Неактуальный статус заказов',
    amount: 1000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const usePenalties = () => {
  const { user } = useAuthStore();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Загрузка штрафов
  useEffect(() => {
    const loadPenalties = async () => {
      try {
        setIsLoading(true);
        // TODO: Заменить на реальный API вызов
        // const response = await apiClient.getPenalties();
        // setPenalties(response.data);
        
        // Временно используем mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        setPenalties(MOCK_PENALTIES);
      } catch (err) {
        console.error('Error loading penalties:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки штрафов');
      } finally {
        setIsLoading(false);
      }
    };

    loadPenalties();
  }, []);

  const handleEditPenalty = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsEditModalOpen(true);
  };

  const handleDeletePenalty = async (id: number) => {
    try {
      // TODO: Заменить на реальный API вызов
      // await apiClient.deletePenalty(id);
      
      // Временно удаляем из локального состояния
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
      // TODO: Заменить на реальный API вызов
      // await apiClient.updatePenalty(id, data);
      
      // Временно обновляем локальное состояние
      setPenalties(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, ...data }
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
      // TODO: Заменить на реальный API вызов
      // const response = await apiClient.createPenalty(data);
      // setPenalties(prev => [...prev, response.data]);
      
      // Временно добавляем в локальное состояние
      const newPenalty: Penalty = {
        id: Math.max(...penalties.map(p => p.id), 0) + 1,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setPenalties(prev => [newPenalty, ...prev]);
    } catch (err) {
      console.error('Error creating penalty:', err);
      throw err;
    }
  };

  return {
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
  };
};

