import { useCallback, useState } from 'react';
import type { Call } from '@/types/orders';
import { callsService } from '@/services';
import { notifyApiError } from '@/lib/error-handling';

export function useOrderCalls() {
  const [orderCalls, setOrderCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  const loadOrderCalls = useCallback(async (callIds: string) => {
    if (!callIds) return;

    setLoadingCalls(true);
    try {
      const callIdArray = callIds.split(',');
      const calls = await Promise.all(
        callIdArray.map(async (callId) => {
          try {
            return await callsService.getCallById(callId);
          } catch {
            return null;
          }
        })
      );
      setOrderCalls(calls.filter((call): call is Call => call !== null));
    } catch (error) {
      notifyApiError(error, 'Ошибка загрузки звонков', 'useOrderCalls.loadOrderCalls');
      setOrderCalls([]);
    } finally {
      setLoadingCalls(false);
    }
  }, []);

  return {
    orderCalls,
    loadingCalls,
    loadOrderCalls,
    setOrderCalls,
  };
}

