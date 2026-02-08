import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  /** iOS требует установки PWA на домашний экран для push */
  isIOSPWARequired: boolean;
  /** Приложение запущено как PWA (standalone) */
  isStandalone: boolean;
}

/**
 * Определяет, является ли устройство iOS
 */
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Определяет, запущено ли приложение как PWA (standalone)
 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');
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
    isIOSPWARequired: false,
    isStandalone: false,
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
      const standalone = isStandalone();
      const iosDevice = isIOS();
      
      // Базовая проверка поддержки API
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      
      // iOS Safari поддерживает Push только в PWA режиме (iOS 16.4+)
      // В обычном Safari push не работает
      const isIOSBrowser = iosDevice && !standalone;
      
      const isSupported = hasServiceWorker && hasPushManager && hasNotification && !isIOSBrowser;

      if (!hasServiceWorker || !hasPushManager || !hasNotification) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: false,
          error: 'Push-уведомления не поддерживаются в этом браузере',
        }));
        return;
      }
      
      // iOS в браузере - нужно установить PWA
      if (isIOSBrowser) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: true,
          error: 'На iOS добавьте приложение на домашний экран для получения уведомлений',
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
          isIOSPWARequired: false,
          isStandalone: standalone,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: false,
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

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Сервер не сохранил подписку');
      }

      return response.data;
    },
    onSuccess: async () => {
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        error: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['push-settings'] });

      // Автоматически отправляем тестовый push для проверки
      try {
        const testResponse = await api.post('/push/test');
        if (testResponse.data?.success) {
          toast.success('Push-уведомления включены! Тестовое уведомление отправлено');
        } else {
          toast.warning('Подписка сохранена, но тестовый push не отправлен. Проверьте настройки VAPID на сервере');
          console.error('[Push] Тест не прошёл:', testResponse.data?.message);
        }
      } catch (err) {
        toast.warning('Подписка сохранена, но не удалось отправить тестовый push');
        console.error('[Push] Ошибка тестового push:', err);
      }
    },
    onError: (error: Error) => {
      console.error('[Push] Ошибка подписки:', error);
      toast.error(`Ошибка подписки: ${error.message}`);
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
      const response = await api.post('/push/test');
      if (response.data?.success) {
        toast.success('Тестовое уведомление отправлено');
      } else {
        toast.error(response.data?.message || 'Не удалось отправить тестовое уведомление');
        console.error('[Push] Тест не прошёл:', response.data);
      }
    } catch (error) {
      toast.error('Ошибка отправки тестового уведомления');
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
    /** Утилиты для проверки платформы */
    isIOS: isIOS(),
  };
};
