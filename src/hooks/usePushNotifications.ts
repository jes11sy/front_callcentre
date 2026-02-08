import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// VAPID публичный ключ - должен совпадать с бэкендом
// Генерируется командой: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
  error: string | null;
}

interface PushSettingsResponse {
  success: boolean;
  data: {
    enabled: boolean;
    callIncoming: boolean;
    callMissed: boolean;
  };
}

/**
 * Конвертирует VAPID ключ из base64 в Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Хук для управления push-уведомлениями
 */
export const usePushNotifications = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
    error: null,
  });

  // Получение настроек push с сервера
  const { data: settingsData } = useQuery<PushSettingsResponse>({
    queryKey: ['push-settings'],
    queryFn: async () => {
      const response = await api.get('/push/settings');
      return response.data;
    },
    staleTime: 60000,
    retry: false,
  });

  // Проверка поддержки и текущего состояния
  useEffect(() => {
    const checkSupport = async () => {
      // Проверяем поддержку
      const isSupported = 
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window;

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Push-уведомления не поддерживаются в этом браузере',
        }));
        return;
      }

      // Проверяем разрешение
      const permission = Notification.permission;

      // Проверяем текущую подписку
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
          isLoading: false,
          error: 'Ошибка проверки подписки',
        }));
        console.error('[Push] Ошибка проверки:', error);
      }
    };

    checkSupport();
  }, []);

  // Мутация для подписки (вызывается ПОСЛЕ получения разрешения)
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID ключ не настроен. Проверьте NEXT_PUBLIC_VAPID_PUBLIC_KEY');
      }

      // Получаем service worker
      const registration = await navigator.serviceWorker.ready;

      // Подписываемся на push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Отправляем подписку на сервер
      const response = await api.post('/push/subscribe', {
        subscription: subscription.toJSON(),
      });

      return response.data;
    },
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        error: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['push-settings'] });
    },
    onError: (error: Error) => {
      console.error('[Push] Ошибка подписки:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
    },
  });

  // Мутация для отписки
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Отписываемся локально
        await subscription.unsubscribe();

        // Удаляем подписку на сервере
        await api.post('/push/unsubscribe', {
          endpoint: subscription.endpoint,
        });
      }
    },
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        error: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['push-settings'] });
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
    },
  });

  // Мутация для обновления настроек
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { callIncoming?: boolean; callMissed?: boolean }) => {
      const response = await api.patch('/push/settings', settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-settings'] });
    },
  });

  // Подписка на push
  // ВАЖНО: requestPermission() вызывается НАПРЯМУЮ в обработчике клика,
  // ДО мутации React Query. На мобильных браузерах запрос разрешения
  // блокируется если вызван не из прямого user gesture.
  const subscribe = useCallback(async () => {
    try {
      if (!VAPID_PUBLIC_KEY) {
        setState(prev => ({ ...prev, error: 'VAPID ключ не настроен' }));
        console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY не задан');
        return;
      }

      // Запрашиваем разрешение СРАЗУ в контексте клика (user gesture)
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, error: 'Разрешение на уведомления не получено' }));
        return;
      }

      setState(prev => ({ ...prev, permission: 'granted' }));

      // Теперь запускаем мутацию для подписки на push и отправки на сервер
      subscribeMutation.mutate();
    } catch (error) {
      console.error('[Push] Ошибка при запросе разрешения:', error);
      setState(prev => ({ ...prev, error: 'Не удалось запросить разрешение' }));
    }
  }, [subscribeMutation]);

  // Отписка от push
  const unsubscribe = useCallback(() => {
    unsubscribeMutation.mutate();
  }, [unsubscribeMutation]);

  // Обновление настроек
  const updateSettings = useCallback((settings: { callIncoming?: boolean; callMissed?: boolean }) => {
    updateSettingsMutation.mutate(settings);
  }, [updateSettingsMutation]);

  // Тестовое уведомление
  const sendTestNotification = useCallback(async () => {
    try {
      await api.post('/push/test');
    } catch (error) {
      console.error('[Push] Ошибка отправки тестового уведомления:', error);
    }
  }, []);

  return {
    ...state,
    settings: settingsData?.data || { enabled: false, callIncoming: true, callMissed: true },
    subscribe,
    unsubscribe,
    updateSettings,
    sendTestNotification,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
};
