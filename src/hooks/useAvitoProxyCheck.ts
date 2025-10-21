import { useState } from 'react';
import authApi from '@/lib/auth';
import { toast } from 'sonner';
import { AvitoAccount, ProxyCheckResult } from '@/types/avito';

export const useAvitoProxyCheck = () => {
  const [proxyCheckResults, setProxyCheckResults] = useState<ProxyCheckResult>({});
  const [checkingProxyIds, setCheckingProxyIds] = useState<Set<number>>(new Set());
  const [proxyAccounts, setProxyAccounts] = useState<AvitoAccount[]>([]);
  const [loadingProxyData, setLoadingProxyData] = useState(false);

  const loadProxyData = async () => {
    setLoadingProxyData(true);
    try {
      const response = await authApi.get('/avito/proxy-data');
      setProxyAccounts(response.data.accounts);
    } catch (error: unknown) {
      console.error('Failed to load proxy data:', error);
      toast.error('Ошибка загрузки данных прокси', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при загрузке данных прокси.',
      });
    } finally {
      setLoadingProxyData(false);
    }
  };

  const handleCheckSingleProxy = async (account: AvitoAccount) => {
    if (!account.proxyHost) {
      setProxyCheckResults(prev => ({
        ...prev,
        [account.id]: 'Прокси не настроен'
      }));
      return;
    }

    setCheckingProxyIds(prev => new Set(prev).add(account.id));
    
    try {
      const response = await authApi.post('/avito/test-proxy', {
        proxyType: account.proxyType,
        proxyHost: account.proxyHost,
        proxyPort: account.proxyPort,
        proxyLogin: account.proxyLogin,
        proxyPassword: account.proxyPassword,
      });

      setProxyCheckResults(prev => ({
        ...prev,
        [account.id]: response.data.success ? '✅ Работает' : `❌ ${response.data.message}`
      }));
    } catch (error: unknown) {
      let errorMessage = 'Неизвестная ошибка';
      
      if ((error as { response?: { data?: { message?: string } } }).response?.data?.message) {
        errorMessage = (error as { response: { data: { message: string } } }).response.data.message;
      } else if ((error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message) {
        errorMessage = (error as { response: { data: { error: { message: string } } } }).response.data.error.message;
      } else if ((error as { message?: string }).message) {
        errorMessage = (error as { message: string }).message;
      }
      
      // Дополнительная информация для диагностики
      if (errorMessage.toLowerCase().includes('auth')) {
        errorMessage += ` (Проверьте логин: ${account.proxyLogin})`;
      }
      
      setProxyCheckResults(prev => ({
        ...prev,
        [account.id]: `❌ ${errorMessage}`
      }));
    } finally {
      setCheckingProxyIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(account.id);
        return newSet;
      });
    }
  };

  const clearResults = () => {
    setProxyCheckResults({});
    setCheckingProxyIds(new Set());
  };

  return {
    proxyCheckResults,
    setProxyCheckResults,
    checkingProxyIds,
    setCheckingProxyIds,
    proxyAccounts,
    setProxyAccounts,
    loadingProxyData,
    setLoadingProxyData,
    loadProxyData,
    handleCheckSingleProxy,
    clearResults,
  };
};
