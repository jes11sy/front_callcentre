import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authApi from '@/lib/auth';
import { toast } from 'sonner';
import { AvitoAccount, AvitoFormData, AvitoStats } from '@/types/avito';
import { logger } from '@/lib/logger';

// Zod schemas for validation
const avitoSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  clientId: z.string().min(1, 'Client ID обязателен'),
  clientSecret: z.string().min(1, 'Client Secret обязателен'),
  userId: z.string().optional(),
  proxyType: z.enum(['http', 'socks4', 'socks5']).optional(),
  proxyHost: z.string().optional(),
  proxyPort: z.string().optional(),
  proxyLogin: z.string().optional(),
  proxyPassword: z.string().optional(),
});

export const useAvitoAccounts = () => {
  const [accounts, setAccounts] = useState<AvitoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [syncingAccount, setSyncingAccount] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [testingProxy, setTestingProxy] = useState(false);

  const createForm = useForm<AvitoFormData>({
    resolver: zodResolver(avitoSchema),
    defaultValues: {
      name: '',
      clientId: '',
      clientSecret: '',
      proxyType: undefined,
      proxyHost: '',
      proxyPort: '',
      proxyLogin: '',
      proxyPassword: '',
    },
  });

  const editForm = useForm<AvitoFormData>({
    resolver: zodResolver(avitoSchema),
    defaultValues: {
      name: '',
      clientId: '',
      clientSecret: '',
      proxyType: undefined,
      proxyHost: '',
      proxyPort: '',
      proxyLogin: '',
      proxyPassword: '',
    },
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await authApi.get('/avito');
      setAccounts(response.data.data || response.data.accounts || []);
    } catch (error: unknown) {
      console.error('Failed to fetch Avito accounts:', error);
      toast.error('Ошибка загрузки аккаунтов', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при загрузке списка аккаунтов.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) {
      return [];
    }
    return accounts.filter(account =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.clientId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const stats: AvitoStats = useMemo(() => {
    const totalAccounts = accounts?.length || 0;
    const connectedAccounts = accounts?.filter(acc => acc.connectionStatus === 'connected').length || 0;
    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.accountBalance || 0), 0) || 0;
    const totalAds = accounts?.reduce((sum, acc) => sum + (acc.adsCount || 0), 0) || 0;
    const totalViews = accounts?.reduce((sum, acc) => sum + (acc.viewsCount || 0), 0) || 0;
    const totalContacts = accounts?.reduce((sum, acc) => sum + (acc.contactsCount || 0), 0) || 0;
    const viewsToday = accounts?.reduce((sum, acc) => sum + (acc.viewsToday || 0), 0) || 0;
    const contactsToday = accounts?.reduce((sum, acc) => sum + (acc.contactsToday || 0), 0) || 0;

    return {
      totalAccounts,
      connectedAccounts,
      totalBalance,
      totalAds,
      totalViews,
      totalContacts,
      viewsToday,
      contactsToday,
    };
  }, [accounts]);

  const handleCreateAccount = async (data: AvitoFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.post('/avito', data);
      toast.success('Аккаунт Avito успешно добавлен', {
        description: `${data.name} добавлен в систему`
      });
      createForm.reset();
      fetchAccounts();
      return true;
    } catch (error: unknown) {
      console.error('Failed to create Avito account:', error);
      toast.error('Ошибка добавления аккаунта', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при добавлении аккаунта.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = async (data: AvitoFormData, accountId: number) => {
    setIsSubmitting(true);
    try {
      await authApi.put(`/avito/${accountId}`, data);
      toast.success('Аккаунт Avito успешно обновлен', {
        description: `${data.name} обновлен в системе`
      });
      editForm.reset();
      fetchAccounts();
      return true;
    } catch (error: unknown) {
      console.error('Failed to update Avito account:', error);
      toast.error('Ошибка обновления аккаунта', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при обновлении аккаунта.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    setIsSubmitting(true);
    try {
      await authApi.delete(`/avito/${accountId}`);
      toast.success('Аккаунт Avito успешно удален');
      fetchAccounts();
      return true;
    } catch (error: unknown) {
      console.error('Failed to delete Avito account:', error);
      toast.error('Ошибка удаления аккаунта', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при удалении аккаунта.',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (account: AvitoAccount) => {
    setTestingConnection(account.id);
    try {
      const response = await authApi.post(`/avito/${account.id}/test`);
      const result = response.data.result;
      
      if (result.success) {
        toast.success('Тест подключения успешен', {
          description: result.message
        });
      } else {
        toast.error('Ошибка подключения', {
          description: result.message
        });
      }
      
      fetchAccounts(); // Refresh the list to show updated status
    } catch (error: unknown) {
      console.error('Failed to test connection:', error);
      toast.error('Ошибка тестирования', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при тестировании подключения.',
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSyncAccount = async (account: AvitoAccount) => {
    setSyncingAccount(account.id);
    try {
      await authApi.post(`/avito/${account.id}/sync`);
      toast.success('Данные аккаунта синхронизированы', {
        description: `${account.name} обновлен`
      });
      fetchAccounts(); // Refresh the list to show updated data
    } catch (error: unknown) {
      console.error('Failed to sync account:', error);
      toast.error('Ошибка синхронизации', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при синхронизации данных.',
      });
    } finally {
      setSyncingAccount(null);
    }
  };

  const handleSyncAllAccounts = async () => {
    setSyncingAll(true);
    try {
      const response = await authApi.post('/avito/sync-all');
      const summary = response.data.summary;
      
      toast.success('Массовая синхронизация завершена', {
        description: `Успешно: ${summary.successful}, Ошибок: ${summary.failed}`
      });
      
      fetchAccounts(); // Refresh the list to show updated data
    } catch (error: unknown) {
      console.error('Failed to sync all accounts:', error);
      toast.error('Ошибка массовой синхронизации', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при синхронизации всех аккаунтов.',
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleTestProxy = async (formData: AvitoFormData) => {
    // Проверяем, что заполнены обязательные поля прокси
    if (!formData.proxyHost || !formData.proxyPort || !formData.proxyType) {
      toast.error('Заполните обязательные поля прокси', {
        description: 'Хост, порт и тип прокси обязательны для проверки'
      });
      return;
    }

    setTestingProxy(true);
    try {
      // Отправляем запрос на тестирование прокси
      const response = await authApi.post('/avito/test-proxy', {
        proxyType: formData.proxyType,
        proxyHost: formData.proxyHost,
        proxyPort: parseInt(formData.proxyPort),
        proxyLogin: formData.proxyLogin,
        proxyPassword: formData.proxyPassword,
      });

      if (response.data.success) {
        toast.success('Прокси работает', {
          description: response.data.message
        });
      } else {
        toast.error('Прокси не работает', {
          description: response.data.message
        });
      }
    } catch (error: unknown) {
      console.error('Failed to test proxy:', error);
      toast.error('Ошибка тестирования прокси', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Произошла ошибка при тестировании прокси.',
      });
    } finally {
      setTestingProxy(false);
    }
  };

  const handleRegisterWebhook = async () => {
    try {
      // Get the webhook URL from environment or construct it
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://apikc.lead-schem.ru';
      // Remove trailing slash if present
      const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const webhookUrl = `${baseUrl}/api/webhooks/avito`;
      
      
      const response = await authApi.post('/avito-messenger/webhook/register-all', {
        webhookUrl: webhookUrl
      });
      
      if (response.data.success) {
        const successCount = response.data.data?.summary?.success || 0;
        const totalCount = response.data.data?.summary?.total || 0;
        
        logger.log('Webhook registered:', webhookUrl);
        logger.log('Results:', response.data.data);
        
        toast.success('Webhook зарегистрирован', {
          description: `Успешно зарегистрировано для ${successCount} из ${totalCount} аккаунтов. URL: ${webhookUrl}`
        });
      } else {
        throw new Error(response.data.message || 'Ошибка регистрации webhook');
      }
    } catch (error: unknown) {
      logger.error('Webhook registration failed:', error);
      toast.error('Ошибка регистрации webhook', {
        description: (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message || 'Не удалось зарегистрировать webhook',
      });
    }
  };

  return {
    // State
    accounts,
    loading,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    testingConnection,
    syncingAccount,
    syncingAll,
    testingProxy,
    filteredAccounts,
    stats,
    
    // Forms
    createForm,
    editForm,
    
    // Actions
    fetchAccounts,
    handleCreateAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleTestConnection,
    handleSyncAccount,
    handleSyncAllAccounts,
    handleTestProxy,
    handleRegisterWebhook,
  };
};
