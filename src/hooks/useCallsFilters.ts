'use client';

import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CallFilters } from '@/types/telephony';
import { useOptimizedSearch } from './useOptimizedSearch';

const filtersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  city: z.string().optional(),
  rk: z.string().optional(),
  status: z.string().optional(),
  avitoName: z.string().optional(),
});

export const useCallsFilters = () => {
  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('dateCreate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(20);
  const [totalCalls, setTotalCalls] = useState(0);

  // Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CallFilters>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      dateFrom: '',
      dateTo: '',
      city: '',
      rk: '',
      status: '',
      avitoName: ''
    }
  });

  const watchedFilters = watch();

  // Оптимизированный поиск
  const search = useOptimizedSearch({
    debounceMs: 500,
    minLength: 2,
    onSearch: useCallback((term: string) => {
      // Поиск будет обрабатываться через apiParams
    }, [])
  });

  // Мемоизированные функции
  const onFiltersSubmit = useCallback((data: CallFilters) => {
    setCurrentPage(1);
    return data;
  }, []);

  const clearFilters = useCallback(() => {
    reset();
    setCurrentPage(1);
    search?.setSearchTerm?.('');
  }, [reset, search]);

  const _handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  // Мемоизированные параметры для API
  const apiParams = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    // Add filters to params
    Object.entries(watchedFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value);
      }
    });

    // Add search term as general filter
    if (search?.debouncedSearchTerm?.trim()) {
      params.append('search', search.debouncedSearchTerm.trim());
    }

    return params;
  }, [currentPage, limit, sortBy, sortOrder, watchedFilters, search?.debouncedSearchTerm]);

  // Стабилизированная версия apiParams для предотвращения бесконечных запросов
  const stableApiParams = useMemo(() => {
    return apiParams.toString();
  }, [apiParams]);

  return {
    // States
    searchTerm: search?.searchTerm || '',
    currentPage,
    totalPages,
    totalCalls,
    sortBy,
    sortOrder,
    showFilters,
    limit,
    
    // Form
    register,
    handleSubmit,
    errors,
    watchedFilters,
    
    // Computed
    apiParams,
    stableApiParams,
    
    // Functions
    setSearchTerm: search?.setSearchTerm || (() => {}),
    setCurrentPage,
    setTotalPages,
    setTotalCalls,
    setShowFilters,
    setLimit,
    onFiltersSubmit,
    clearFilters,
    handleSearch: search?.handleSearch || (() => {}),
    handleSort
  };
};
