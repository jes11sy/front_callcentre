'use client';

// 🍪 Хуки для получения статических данных с httpOnly cookies
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api'; // Используем настроенный axios instance

// Хук для получения списка городов
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await api.get('/cities');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Хук для получения списка РК
export const useRKs = () => {
  return useQuery({
    queryKey: ['rks'],
    queryFn: async () => {
      const response = await api.get('/rks');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Хук для получения списка Авито аккаунтов
export const useAvitoAccounts = () => {
  return useQuery({
    queryKey: ['avito-accounts'],
    queryFn: async () => {
      const response = await api.get('/avito-accounts');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час
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
