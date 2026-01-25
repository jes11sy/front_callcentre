// Унифицированная система уведомлений - устраняет дублирование кода
import { toast } from 'sonner';
import { NotificationOptions } from '@/types/common';
import { logger } from '@/lib/logger';

// Базовые настройки для разных типов уведомлений
const NOTIFICATION_CONFIG = {
  success: {
    duration: 4000,
    sound: 'success'
  },
  error: {
    duration: 6000,
    sound: 'error'
  },
  warning: {
    duration: 5000,
    sound: 'warning'
  },
  info: {
    duration: 4000,
    sound: 'info'
  }
} as const;

// Воспроизведение звуков уведомлений
function playNotificationSound(type: keyof typeof NOTIFICATION_CONFIG) {
  if (typeof window === 'undefined') return;
  
  try {
    // Здесь можно добавить логику воспроизведения звуков
    // Например, через Web Audio API или HTML5 Audio
    logger.log(`Playing ${type} notification sound`);
  } catch (error) {
    logger.warn('Failed to play notification sound:', error);
  }
}

// Базовый метод для создания уведомлений
function createNotification(
  type: keyof typeof NOTIFICATION_CONFIG,
  message: string,
  options?: NotificationOptions
) {
  const config = NOTIFICATION_CONFIG[type];
  
  // Воспроизводим звук
  playNotificationSound(type);
  
  // Создаем уведомление
  const toastOptions = {
    description: options?.description,
    duration: options?.duration || config.duration,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick
    } : undefined,
  };

  // Вызываем соответствующий метод toast
  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast.warning(message, toastOptions);
    case 'info':
      return toast.info(message, toastOptions);
    default:
      return toast(message, toastOptions);
  }
}

// Унифицированный сервис уведомлений
export const notifications = {
  // Успешные операции
  success(message: string, options?: NotificationOptions) {
    return createNotification('success', message, options);
  },

  // Ошибки
  error(message: string, options?: NotificationOptions) {
    return createNotification('error', message, options);
  },

  // Предупреждения
  warning(message: string, options?: NotificationOptions) {
    return createNotification('warning', message, options);
  },

  // Информационные сообщения
  info(message: string, options?: NotificationOptions) {
    return createNotification('info', message, options);
  },

  // Загрузка
  loading(message: string) {
    return toast.loading(message);
  },

  // Закрытие уведомления
  dismiss(id: string) {
    toast.dismiss(id);
  },

  // Promise уведомления
  promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Специализированные уведомления для заказов
  order: {
    created: (message?: string, orderId?: number) => 
      notifications.success(message || `Заказ ${orderId ? `#${orderId}` : ''} успешно создан`),
    
    updated: (orderId?: number) => 
      notifications.success(`Заказ ${orderId ? `#${orderId}` : ''} успешно обновлен`),
    
    deleted: (orderId?: number) => 
      notifications.success(`Заказ ${orderId ? `#${orderId}` : ''} успешно удален`),
    
    error: (action: string = 'создания') => 
      notifications.error(`Ошибка при ${action} заказа`),
    
    validationError: (field: string) => 
      notifications.error(`Ошибка валидации: ${field}`)
  },

  // Специализированные уведомления для API
  api: {
    connectionError: () => 
      notifications.error('Ошибка соединения с сервером'),
    
    serverError: () => 
      notifications.error('Ошибка сервера'),
    
    unauthorized: () => 
      notifications.error('Необходима авторизация'),
    
    forbidden: () => 
      notifications.error('Доступ запрещен'),
    
    notFound: (resource: string = 'ресурс') => 
      notifications.error(`${resource} не найден`),
    
    timeout: () => 
      notifications.error('Превышено время ожидания запроса')
  },

  // Специализированные уведомления для форм
  form: {
    validationError: (field: string) => 
      notifications.error(`Ошибка валидации поля: ${field}`),
    
    submitError: () => 
      notifications.error('Ошибка при отправке формы'),
    
    submitSuccess: () => 
      notifications.success('Форма успешно отправлена'),
    
    reset: () => 
      notifications.info('Форма сброшена')
  }
};

// Хук для работы с уведомлениями
export function useNotifications() {
  return {
    showSuccess: notifications.success,
    showError: notifications.error,
    showWarning: notifications.warning,
    showInfo: notifications.info,
    showLoading: notifications.loading,
    dismiss: notifications.dismiss,
    promise: notifications.promise,
    order: notifications.order,
    api: notifications.api,
    form: notifications.form
  };
}

// Утилиты для работы с уведомлениями
export const notificationUtils = {
  // Создание уведомления с автоматическим закрытием
  autoClose(message: string, type: keyof typeof NOTIFICATION_CONFIG = 'info', delay: number = 3000) {
    const id = createNotification(type, message);
    setTimeout(() => {
      notifications.dismiss(id);
    }, delay);
    return id;
  },

  // Создание уведомления с кнопкой повтора
  withRetry(message: string, onRetry: () => void, type: keyof typeof NOTIFICATION_CONFIG = 'error') {
    return createNotification(type, message, {
      action: {
        label: 'Повторить',
        onClick: onRetry
      }
    });
  },

  // Создание уведомления с кнопкой закрытия
  withDismiss(message: string, type: keyof typeof NOTIFICATION_CONFIG = 'info') {
    return createNotification(type, message, {
      action: {
        label: 'Закрыть',
        onClick: () => {}
      }
    });
  }
};
