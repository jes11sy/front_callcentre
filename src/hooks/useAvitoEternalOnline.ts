import { useState } from 'react';
import authApi from '@/lib/auth';
import { toast } from 'sonner';
import { AvitoAccount, OnlineStatuses, EternalOnlineSettings } from '@/types/avito';
import { logger } from '@/lib/logger';

export const useAvitoEternalOnline = () => {
  const [onlineStatuses, setOnlineStatuses] = useState<OnlineStatuses>({});
  const [eternalOnlineSettings, setEternalOnlineSettings] = useState<EternalOnlineSettings>({});
  const [updatingOnlineStatus, setUpdatingOnlineStatus] = useState<Set<number>>(new Set());

  const loadOnlineStatuses = async (accounts: AvitoAccount[]) => {
    try {
      // Загружаем текущие статусы онлайн и настройки вечного онлайна
      const response = await authApi.get('/avito/online-statuses');
      setOnlineStatuses(response.data.onlineStatuses || {});
      setEternalOnlineSettings(response.data.eternalOnlineSettings || {});
    } catch (error: unknown) {
      logger.error('Failed to load online statuses:', error);
      // Инициализируем пустыми объектами если нет данных
      const initialStatuses: {[key: number]: boolean} = {};
      const initialSettings: {[key: number]: boolean} = {};
      accounts.forEach(account => {
        initialStatuses[account.id] = false; // По умолчанию оффлайн
        initialSettings[account.id] = false; // По умолчанию выключен
      });
      setOnlineStatuses(initialStatuses);
      setEternalOnlineSettings(initialSettings);
    }
  };

  const handleToggleEternalOnline = async (accountId: number, enabled: boolean) => {
    setUpdatingOnlineStatus(prev => new Set(prev).add(accountId));
    
    try {
      await authApi.post(`/avito/${accountId}/eternal-online`, {
        enabled
      });
      
      setEternalOnlineSettings(prev => ({
        ...prev,
        [accountId]: enabled
      }));
      
      // Если включаем вечный онлайн, сразу ставим статус онлайн
      if (enabled) {
        setOnlineStatuses(prev => ({
          ...prev,
          [accountId]: true
        }));
      }
      
      toast.success(enabled ? 'Вечный онлайн включен' : 'Вечный онлайн выключен', {
        description: `Аккаунт будет ${enabled ? 'всегда онлайн' : 'управляться вручную'}`
      });
    } catch (error: unknown) {
      logger.error('Failed to toggle eternal online:', error);
      toast.error('Ошибка изменения настройки', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при изменении настройки вечного онлайна.',
      });
    } finally {
      setUpdatingOnlineStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  return {
    onlineStatuses,
    setOnlineStatuses,
    eternalOnlineSettings,
    setEternalOnlineSettings,
    updatingOnlineStatus,
    setUpdatingOnlineStatus,
    loadOnlineStatuses,
    handleToggleEternalOnline,
  };
};
