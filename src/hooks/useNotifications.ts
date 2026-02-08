import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlobalSocket } from './useGlobalSocket';
import api from '@/lib/api';

/**
 * Типы уведомлений:
 * 
 * КЦ:
 * - call_incoming - входящий звонок
 * - call_missed - пропущенный звонок
 * - order_created - заказ создан
 * - order_edited - заказ изменён
 * 
 * Директор:
 * - order_new - новый заказ в городе
 * - order_accepted - мастер принял заказ
 * - order_rescheduled - заказ перенесён
 * - order_rejected - незаказ
 * - order_closed - заказ закрыт
 * 
 * Мастер:
 * - master_assigned - назначен на заказ
 * - master_order_rescheduled - заказ перенесён
 * - master_order_rejected - заказ отменён
 * 
 * Общие:
 * - system - системное
 */
export type NotificationType =
  // КЦ
  | 'call_incoming'
  | 'call_missed'
  | 'order_created'
  | 'order_edited'
  // Директор
  | 'order_new'
  | 'order_accepted'
  | 'order_rescheduled'
  | 'order_rejected'
  | 'order_closed'
  // Мастер
  | 'master_assigned'
  | 'master_order_rescheduled'
  | 'master_order_rejected'
  // Общие
  | 'system';

export interface UINotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: number;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: UINotification[];
    unreadCount: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { on, isConnected } = useGlobalSocket();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Получение уведомлений
  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
    staleTime: 30000, // 30 секунд
    refetchInterval: 60000, // Обновлять каждую минуту как fallback
  });

  // Получение количества непрочитанных (легкий запрос)
  const { data: unreadData } = useQuery<UnreadCountResponse>({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    },
    staleTime: 10000, // 10 секунд
    refetchInterval: 30000, // Обновлять каждые 30 секунд
  });

  // Отметить как прочитанное
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.post('/notifications/read', {
        notificationId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Отметить все как прочитанные
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Удалить уведомление
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Очистить все уведомления
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/notifications');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  // Подписка на WebSocket события
  useEffect(() => {
    if (!isConnected) return;

    // Новое уведомление
    const unsubNew = on('notification:new', (notification: unknown) => {
      // Оптимистичное обновление
      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            notifications: [notification as UINotification, ...old.data.notifications].slice(0, 50),
            unreadCount: old.data.unreadCount + 1,
          },
        };
      });
      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: { unreadCount: old.data.unreadCount + 1 },
        };
      });
    });

    // Уведомление прочитано
    const unsubRead = on('notification:read', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    });

    // Все прочитаны
    const unsubAllRead = on('notification:all_read', () => {
      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            notifications: old.data.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
          },
        };
      });
      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread'], () => ({
        success: true,
        data: { unreadCount: 0 },
      }));
    });

    // Все очищены
    const unsubCleared = on('notification:cleared', () => {
      queryClient.setQueryData<NotificationsResponse>(['notifications'], () => ({
        success: true,
        data: { notifications: [], unreadCount: 0 },
      }));
      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread'], () => ({
        success: true,
        data: { unreadCount: 0 },
      }));
    });

    return () => {
      unsubNew();
      unsubRead();
      unsubAllRead();
      unsubCleared();
    };
  }, [isConnected, on, queryClient]);

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = unreadData?.data?.unreadCount ?? notificationsData?.data?.unreadCount ?? 0;

  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const clearAll = useCallback(() => {
    clearAllMutation.mutate();
  }, [clearAllMutation]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch,
  };
};
