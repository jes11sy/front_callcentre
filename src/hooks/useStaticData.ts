'use client';

// 🍪 Хуки для получения справочных данных с /references/*
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const STALE_TIME = 30 * 60 * 1000; // 30 минут
const GC_TIME = 60 * 60 * 1000;    // 1 час

// Хук для получения списка городов из справочника
export const useCities = () => {
  return useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await api.get('/references/cities', { params: { isActive: true } });
      return (response.data?.data || []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }));
    },
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
    queryFn: async () => {
      const response = await api.get('/references/rks', { params: { isActive: true } });
      return (response.data?.data || []).map((r: { id: number; name: string }) => ({ id: r.id, name: r.name }));
    },
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
    queryFn: async () => {
      const response = await api.get('/references/equipment-types', { params: { isActive: true } });
      return (response.data?.data || []).map((e: { id: number; name: string }) => ({ id: e.id, name: e.name }));
    },
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
    queryFn: async () => {
      const response = await api.get('/operators');
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 минут (операторы могут меняться чаще)
    gcTime: 30 * 60 * 1000, // 30 минут
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
