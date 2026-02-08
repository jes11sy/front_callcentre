import { useState, useEffect, useCallback, useRef } from 'react';
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
  /** Версия iOS (если устройство iOS) */
  iosVersion: number | null;
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
 * Получает версию iOS
 * Push в PWA поддерживается только с iOS 16.4+
 */
function getIOSVersion(): number | null {
  if (typeof window === 'undefined') return null;
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  if (match) {
    return parseFloat(`${match[1]}.${match[2]}`);
  }
  return null;
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
    iosVersion: null,
  });
  
  // Ref для доступа к мутации в useEffect (избегаем circular dependency)
  const subscribeMutationRef = useRef<{ mutate: () => void } | null>(null);

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

  // Обработка сообщения от SW о смене подписки
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        console.log('[Push] Подписка изменилась, переподписываемся...');
        // Автоматически переподписываемся через ref
        subscribeMutationRef.current?.mutate();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Проверка поддержки и текущего состояния
  useEffect(() => {
    const checkSupport = async () => {
      const standalone = isStandalone();
      const iosDevice = isIOS();
      const iosVer = getIOSVersion();
      
      // Базовая проверка поддержки API
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      
      console.log('[Push] Проверка поддержки:', {
        isIOS: iosDevice,
        iosVersion: iosVer,
        isStandalone: standalone,
        hasServiceWorker,
        hasPushManager,
        hasNotification,
      });
      
      // iOS Safari поддерживает Push только в PWA режиме (iOS 16.4+)
      // В обычном Safari push не работает
      const isIOSBrowser = iosDevice && !standalone;
      
      // iOS PWA но версия ниже 16.4 - push не поддерживается
      const isIOSTooOld = iosDevice && standalone && iosVer !== null && iosVer < 16.4;
      
      const isSupported = hasServiceWorker && hasPushManager && hasNotification && !isIOSBrowser && !isIOSTooOld;

      if (!hasServiceWorker || !hasPushManager || !hasNotification) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: false,
          iosVersion: iosVer,
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
          iosVersion: iosVer,
          error: 'На iOS добавьте приложение на домашний экран для получения уведомлений',
        }));
        return;
      }
      
      // iOS PWA но версия слишком старая
      if (isIOSTooOld) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: false,
          iosVersion: iosVer,
          error: `Push-уведомления требуют iOS 16.4 или новее (текущая: ${iosVer})`,
        }));
        return;
      }

      // Проверяем разрешение
      const permission = Notification.permission;
      console.log('[Push] Текущее разрешение:', permission);

      // Проверяем текущую подписку с таймаутом
      // navigator.serviceWorker.ready может зависнуть если SW не зарегистрирован
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('SW ready timeout')), 5000);
        });
        
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          timeoutPromise
        ]);
        
        const subscription = await registration.pushManager.getSubscription();
        console.log('[Push] Текущая подписка:', subscription ? 'есть' : 'нет');
        
        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          isLoading: false,
          error: null,
          isIOSPWARequired: false,
          isStandalone: standalone,
          iosVersion: iosVer,
        });
      } catch (error) {
        console.error('[Push] Ошибка проверки:', error);
        // Даже если SW не готов, показываем кнопку - пользователь сможет подписаться
        setState(prev => ({
          ...prev,
          isSupported: true,
          isSubscribed: false,
          permission,
          isLoading: false,
          isStandalone: standalone,
          isIOSPWARequired: false,
          iosVersion: iosVer,
          error: null, // Не показываем ошибку - просто SW ещё не готов
        }));
      }
    };

    checkSupport();
  }, []);

  // Мутация для подписки (вызывается ПОСЛЕ получения разрешения)
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      console.log('[Push] subscribeMutation: начало');
      
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID ключ не настроен. Проверьте NEXT_PUBLIC_VAPID_PUBLIC_KEY');
      }

      // Получаем service worker
      console.log('[Push] Ожидаем готовности Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] Service Worker готов:', registration.scope);

      // Подписываемся на push
      console.log('[Push] Подписываемся на PushManager...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('[Push] Подписка получена:', subscription.endpoint);

      // Отправляем подписку на сервер
      console.log('[Push] Отправляем подписку на сервер...');
      const response = await api.post('/push/subscribe', {
        subscription: subscription.toJSON(),
      });
      console.log('[Push] Ответ сервера:', response.data);

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
  
  // Сохраняем ref на мутацию для использования в useEffect
  useEffect(() => {
    subscribeMutationRef.current = subscribeMutation;
  }, [subscribeMutation]);

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
  // 
  // КРИТИЧНО ДЛЯ iOS PWA: На iOS нельзя вызывать НИЧЕГО перед requestPermission(),
  // даже toast.loading() сбивает контекст user gesture и iOS молча возвращает 'default'
  const subscribe = useCallback(async () => {
    const iosDevice = isIOS();
    const standalone = isStandalone();
    
    console.log('[Push] ====== SUBSCRIBE ВЫЗВАН ======');
    console.log('[Push] Платформа:', { isIOS: iosDevice, isStandalone: standalone });
    console.log('[Push] VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY ? 'установлен' : 'НЕ УСТАНОВЛЕН');
    
    // Быстрые синхронные проверки (не сбивают user gesture)
    if (!VAPID_PUBLIC_KEY) {
      const errorMsg = 'VAPID ключ не настроен';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY не задан');
      return;
    }

    if (!('Notification' in window)) {
      const errorMsg = 'Уведомления не поддерживаются в этом браузере';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      console.error('[Push] Notification API не найден');
      return;
    }
    
    if (!('serviceWorker' in navigator)) {
      const errorMsg = 'Service Worker не поддерживается';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      console.error('[Push] ServiceWorker не поддерживается');
      return;
    }
    
    const currentPermission = Notification.permission;
    console.log('[Push] Текущее разрешение браузера:', currentPermission);
    
    if (currentPermission === 'denied') {
      const errorMsg = 'Уведомления заблокированы. Разрешите их в настройках браузера';
      setState(prev => ({ ...prev, permission: 'denied', error: errorMsg }));
      toast.error(errorMsg);
      console.error('[Push] Уведомления заблокированы пользователем');
      return;
    }

    // Если разрешение уже есть - сразу подписываемся
    if (currentPermission === 'granted') {
      console.log('[Push] Разрешение уже granted, пропускаем диалог, подписываемся...');
      toast.loading('Подключение к серверу...', { id: 'push-subscribe' });
      subscribeMutation.mutate(undefined, {
        onSettled: () => {
          toast.dismiss('push-subscribe');
        }
      });
      return;
    }
    
    console.log('[Push] Разрешение:', currentPermission, '- будем запрашивать диалог');

    // КРИТИЧНО: На iOS PWA вызываем requestPermission СРАЗУ, без каких-либо промежуточных вызовов
    // toast.loading() или любой другой вызов "сбивает" user gesture context
    // НЕ делаем НИКАКИХ async операций до requestPermission!
    console.log('[Push] Запрашиваем разрешение у браузера (iOS: первый async вызов после клика!)...');
    
    let permission: NotificationPermission;
    
    try {
      // ВАЖНО: requestPermission() должен быть первым асинхронным вызовом после клика!
      permission = await Notification.requestPermission();
      console.log('[Push] Результат requestPermission:', permission);
    } catch (permError) {
      console.error('[Push] Ошибка requestPermission:', permError);
      const errorMsg = 'Не удалось запросить разрешение на уведомления';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      return;
    }
    
    // На iOS PWA если permission === 'default' после requestPermission(),
    // это значит что диалог не показался (user gesture был "сбит" или другая проблема)
    if (permission === 'default' && iosDevice && standalone) {
      console.error('[Push] iOS PWA: requestPermission вернул default без показа диалога');
      const errorMsg = 'Не удалось показать запрос разрешения. Попробуйте перезапустить приложение и нажать кнопку снова';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      return;
    }
    
    if (permission === 'denied') {
      const errorMsg = 'Вы отклонили разрешение на уведомления';
      setState(prev => ({ ...prev, permission: 'denied', error: errorMsg }));
      toast.error(errorMsg);
      return;
    }
    
    if (permission !== 'granted') {
      const errorMsg = 'Разрешение на уведомления не получено';
      setState(prev => ({ ...prev, permission, error: errorMsg }));
      toast.warning(errorMsg);
      return;
    }

    // Разрешение получено - теперь можно показывать toast и подписываться
    setState(prev => ({ ...prev, permission: 'granted', error: null }));
    console.log('[Push] Разрешение получено, запускаем подписку на сервер...');
    toast.loading('Подключение к серверу...', { id: 'push-subscribe' });

    subscribeMutation.mutate(undefined, {
      onSettled: () => {
        toast.dismiss('push-subscribe');
      }
    });
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
    /** Версия iOS (если устройство iOS) */
    iosVersion: state.iosVersion,
  };
};
