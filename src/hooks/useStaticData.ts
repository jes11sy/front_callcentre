'use client';

import { useQuery } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/secure-storage';

// Хук для получения списка городов
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      
      return response.json();
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
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/rks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch RKs');
      }
      
      return response.json();
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
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/avito-accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Avito accounts');
      }
      
      return response.json();
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
      const token = await tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/operators`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch operators');
      }
      
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 минут (операторы могут меняться чаще)
    gcTime: 30 * 60 * 1000, // 30 минут
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
