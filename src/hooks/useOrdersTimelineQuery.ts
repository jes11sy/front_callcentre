import { useQuery } from '@tanstack/react-query';
import { buildTimelineParams, ordersService } from '@/services/orders.service';

type UserContext = {
  id?: number;
  role?: string;
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useOrdersTimelineQuery(timelineDate: Date, user?: UserContext | null) {
  const dateFrom = formatDateForApi(timelineDate);

  return useQuery({
    queryKey: ['orders-timeline', user?.id, user?.role, dateFrom],
    queryFn: () => {
      const params = buildTimelineParams(dateFrom);
      return ordersService.getTimelineOrders(params);
    },
    staleTime: 30000,
  });
}

