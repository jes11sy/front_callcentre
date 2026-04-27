'use client';

// 🍪 Хуки для получения справочных данных с /references/*
import { useQuery } from '@tanstack/react-query';
import { referencesService } from '@/services';

const STALE_TIME = 30 * 60 * 1000; // 30 минут
const GC_TIME = 60 * 60 * 1000;    // 1 час

// Хук для получения списка городов из справочника
export const useCities = () => {
  return useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['cities'],
    queryFn: () => referencesService.getCities(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Хук для получения списка РК из справочника
export const useRKs = () => {
  return useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['rks'],
    queryFn: () => referencesService.getRks(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Хук для получения списка типов оборудования из справочника
export const useEquipmentTypes = () => {
  return useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['equipmentTypes'],
    queryFn: () => referencesService.getEquipmentTypes(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

interface OrderStatus {
  id: number;
  name: string;
  code: string;
  color: string;
  group: string;
  sortOrder: number;
  isActive: boolean;
}

export const useOrderStatuses = (group?: 'appeal' | 'order') => {
  return useQuery<OrderStatus[]>({
    queryKey: ['orderStatuses', group],
    queryFn: () => referencesService.getOrderStatuses(group),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useSources = () => {
  return useQuery<string[]>({
    queryKey: ['sources'],
    queryFn: () => referencesService.getSources(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Хук для получения операторов
export const useOperators = () => {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => referencesService.getOperators(),
    staleTime: 15 * 60 * 1000, // 15 минут (операторы могут меняться чаще)
    gcTime: 30 * 60 * 1000, // 30 минут
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
