'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface SearchOptions {
  debounceMs?: number;
  minLength?: number;
  onSearch?: (term: string) => void;
}

export const useOptimizedSearch = (options: SearchOptions = {}) => {
  const {
    debounceMs = 500,
    minLength = 2,
    onSearch
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Мемоизированная проверка необходимости поиска
  const shouldSearch = useMemo(() => {
    return debouncedSearchTerm.length >= minLength;
  }, [debouncedSearchTerm, minLength]);

  // Выполняем поиск при изменении debounced термина
  useEffect(() => {
    if (shouldSearch && onSearch) {
      setIsSearching(true);
      onSearch(debouncedSearchTerm);
      // Сброс состояния поиска через небольшую задержку
      const timer = setTimeout(() => setIsSearching(false), 100);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearchTerm, shouldSearch, onSearch]);

  // Функция для ручного поиска
  const handleSearch = useCallback(() => {
    if (onSearch && searchTerm.length >= minLength) {
      setIsSearching(true);
      onSearch(searchTerm);
      setTimeout(() => setIsSearching(false), 100);
    }
  }, [searchTerm, minLength, onSearch]);

  // Очистка поиска
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    shouldSearch,
    handleSearch,
    clearSearch
  };
};
