'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { SiteOrder } from '@/types/site-orders';

/**
 * Проверяет заявки с сайта со статусом "Перезвонить" и показывает
 * уведомление, когда наступает время перезвона.
 */
export function useCallbackReminder() {
  const notifiedIds = useRef<Set<number>>(new Set());

  const { data } = useQuery<{ data: SiteOrder[] }>({
    queryKey: ['site-orders-callbacks'],
    queryFn: async () => {
      const response = await api.get('/site-orders?status=Перезвонить&limit=50');
      return response.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data?.data) return;

    const now = new Date();
    for (const order of data.data) {
      if (!order.callbackAt) continue;
      const callbackTime = new Date(order.callbackAt);
      const diffMs = callbackTime.getTime() - now.getTime();

      if (diffMs <= 0 && diffMs > -5 * 60_000 && !notifiedIds.current.has(order.id)) {
        notifiedIds.current.add(order.id);
        toast.warning(
          `Пора перезвонить: ${order.clientName} (${order.phone})`,
          {
            duration: 15_000,
            action: {
              label: 'Открыть',
              onClick: () => window.location.assign('/site-orders'),
            },
          }
        );
      }
    }
  }, [data]);
}
