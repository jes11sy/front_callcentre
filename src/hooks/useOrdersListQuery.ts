import { useQuery } from '@tanstack/react-query';
import { buildOrdersParams, ordersService, type OrdersListParams } from '@/services/orders.service';

type UserContext = {
  id?: number;
  role?: string;
};

export function useOrdersListQuery(params: OrdersListParams, user?: UserContext | null) {
  return useQuery({
    queryKey: ['orders', params, user?.id, user?.role],
    queryFn: () => {
      const searchParams = buildOrdersParams(params);
      return ordersService.getOrders(searchParams);
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 0,
    gcTime: 0,
  });
}

