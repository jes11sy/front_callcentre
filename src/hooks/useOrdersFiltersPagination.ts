import { useCallback, useMemo, useState } from 'react';
import type { OrderFilters } from '@/types/orders';

const defaultFilters: OrderFilters = {
  search: '',
  searchId: '',
  searchPhone: '',
  searchAddress: '',
  status: '',
  cityId: '',
  master: '',
  closingDate: '',
};

export function useOrdersFiltersPagination() {
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: filters.search || undefined,
      searchId: filters.searchId || undefined,
      searchPhone: filters.searchPhone || undefined,
      searchAddress: filters.searchAddress || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      cityId: filters.cityId || undefined,
      master: filters.master || undefined,
      closingDate: filters.closingDate || undefined,
    }),
    [page, limit, filters]
  );

  const updateFilter = useCallback((key: keyof OrderFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);

  return {
    filters,
    page,
    limit,
    queryParams,
    setPage,
    setLimit,
    updateFilter,
    resetFilters,
  };
}

