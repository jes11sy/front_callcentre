'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { OrderFilters } from '@/types/orders';
import { STATUS_OPTIONS } from '@/constants/orders';
import { useCities } from '@/hooks/useStaticData';
import { useDesignStore } from '@/store/designStore';

interface OrdersFiltersProps {
  filters: OrderFilters;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
  onReset?: () => void;
  iconOnly?: boolean;
}

const EMPTY_FILTERS: OrderFilters = {
  search: '',
  searchId: '',
  searchPhone: '',
  searchAddress: '',
  status: '',
  cityId: '',
  master: '',
  closingDate: ''
};

export const OrdersFilters = ({ filters, onFilterChange, onReset, iconOnly = false }: OrdersFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OrderFilters>(filters);
  const { data: cities = [] } = useCities();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const buttonLabel = isOpen ? 'Скрыть фильтры' : 'Показать фильтры';

  const hasActiveFilters = !!(
    filters.searchId || filters.searchPhone || filters.searchAddress ||
    (filters.status && filters.status !== 'all') || filters.cityId ||
    filters.master || filters.closingDate
  );

  useEffect(() => {
    if (isOpen && iconOnly) {
      setDraftFilters(filters);
    }
  }, [isOpen, iconOnly, filters]);

  const applyDraftFilters = () => {
    (Object.keys(draftFilters) as Array<keyof OrderFilters>).forEach((key) => {
      if (filters[key] !== draftFilters[key]) {
        onFilterChange(key, draftFilters[key]);
      }
    });
    setIsOpen(false);
  };

  const resetAllFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    if (onReset) {
      onReset();
    } else {
      (Object.keys(EMPTY_FILTERS) as Array<keyof OrderFilters>).forEach((key) => {
        onFilterChange(key, '');
      });
    }
  };

  const fieldClass = `w-full min-h-[44px] px-4 rounded-2xl text-[15px] shadow-sm outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
    isDark
      ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/30'
      : 'border border-[#cfd2d8] bg-white text-[#111113] placeholder:text-[#8e8e93] shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
  }`;

  return (
    <div className={`${iconOnly ? 'relative inline-flex' : 'w-full'} font-myriad`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          title={buttonLabel}
          aria-label={buttonLabel}
          className={
            iconOnly
              ? `relative h-10 w-10 rounded-2xl border p-0 transition-all duration-200 ${
                  isDark
                    ? 'bg-transparent border-white/15 text-white/85 hover:bg-white/[0.06] hover:text-white'
                    : 'bg-white border-gray-200 text-[#3a3a3c] hover:bg-black/[0.035] hover:text-[#111113]'
                }`
              : `w-full sm:w-auto justify-center bg-white dark:bg-[#252d3a] border text-gray-700 dark:text-gray-200 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004] min-w-[120px] sm:min-w-[140px] ${
                  hasActiveFilters
                    ? 'border-[#FEC004] text-[#FEC004]'
                    : 'border-gray-200 dark:border-gray-600'
                }`
          }
        >
          <Filter className={iconOnly ? 'h-5 w-5' : 'mr-2 h-4 w-4'} />
          {!iconOnly && 'Фильтры'}
          {!iconOnly && hasActiveFilters && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#FEC004]" />}
          {!iconOnly && (isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
          {iconOnly && hasActiveFilters && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b3261e]" />}
        </Button>
        {!iconOnly && hasActiveFilters && onReset && (
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Сбросить
          </Button>
        )}
      </div>

      {iconOnly && (
        <>
          <div
            className={`fixed inset-0 z-[10040] transition-opacity duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            } ${isDark ? 'bg-black/50' : 'bg-black/30 backdrop-blur-sm'}`}
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed right-0 top-[calc(4rem+env(safe-area-inset-top,0px))] z-[10050] h-[calc(100dvh-4rem-env(safe-area-inset-top,0px))] w-full transform overflow-y-auto transition-all duration-300 ease-out sm:w-[360px] md:right-4 md:top-4 md:h-[calc(100vh-2rem)] md:rounded-[30px] ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
            } ${
              isDark
                ? 'bg-[#111113]/92 backdrop-blur-xl border-l md:border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)]'
                : 'bg-white border-l md:border border-black/[0.08] shadow-[0_24px_60px_rgba(15,23,42,0.12)]'
            }`}
          >
            <div className={`sticky top-0 border-b px-4 py-4 flex items-center justify-between z-10 ${
              isDark ? 'bg-[#111113]/40 backdrop-blur-md border-white/10' : 'bg-white border-black/[0.08]'
            }`}>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#111113]'}`}>Фильтры</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6e6e73] transition-colors hover:bg-black/[0.04] hover:text-[#111113] dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white"
                aria-label="Закрыть фильтры"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/55'}`}>Поиск</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="ID заказа"
                    value={draftFilters.searchId}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, searchId: e.target.value }))}
                    className={fieldClass}
                  />
                  <Input
                    placeholder="Номер телефона"
                    value={draftFilters.searchPhone}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, searchPhone: e.target.value }))}
                    className={fieldClass}
                  />
                  <Input
                    placeholder="Адрес"
                    value={draftFilters.searchAddress}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, searchAddress: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
              </div>

              <hr className={isDark ? 'border-white/10' : 'border-black/[0.06]'} />

              <div className="space-y-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-black/55'}`}>Основные</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-600 dark:text-gray-400">Статус</Label>
                    <Select value={draftFilters.status || 'all'} onValueChange={(value) => setDraftFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Все статусы" />
                      </SelectTrigger>
                      <SelectContent className={`rounded-2xl border-0 shadow-xl ${isDark ? 'bg-[#1e1e20]' : 'bg-white'}`}>
                        <SelectItem value="all" className={`rounded-xl mx-1 my-0.5 cursor-pointer ${isDark ? 'text-white focus:bg-white/10' : 'text-[#111113] focus:bg-black/5'}`}>Все статусы</SelectItem>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className={`rounded-xl mx-1 my-0.5 cursor-pointer ${isDark ? 'text-white focus:bg-white/10' : 'text-[#111113] focus:bg-black/5'}`}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-600 dark:text-gray-400">Город</Label>
                    <Select value={draftFilters.cityId || 'all'} onValueChange={(value) => setDraftFilters((prev) => ({ ...prev, cityId: value === 'all' ? '' : value }))}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Все города" />
                      </SelectTrigger>
                      <SelectContent className={`rounded-2xl border-0 shadow-xl ${isDark ? 'bg-[#1e1e20]' : 'bg-white'}`}>
                        <SelectItem value="all" className={`rounded-xl mx-1 my-0.5 cursor-pointer ${isDark ? 'text-white focus:bg-white/10' : 'text-[#111113] focus:bg-black/5'}`}>Все города</SelectItem>
                        {cities.map((city) => (
                          <SelectItem
                            key={city.id}
                            value={city.id.toString()}
                            className={`rounded-xl mx-1 my-0.5 cursor-pointer ${isDark ? 'text-white focus:bg-white/10' : 'text-[#111113] focus:bg-black/5'}`}
                          >
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="master" className="text-gray-600 dark:text-gray-400">Мастер</Label>
                    <Input
                      id="master"
                      placeholder="Поиск по мастеру"
                      value={draftFilters.master}
                      onChange={(e) => setDraftFilters((prev) => ({ ...prev, master: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingDate" className="text-gray-600 dark:text-gray-400">Дата закрытия</Label>
                    <Input
                      id="closingDate"
                      type="date"
                      value={draftFilters.closingDate}
                      onChange={(e) => setDraftFilters((prev) => ({ ...prev, closingDate: e.target.value }))}
                      className={`${fieldClass} dark:[color-scheme:dark]`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`sticky bottom-0 border-t px-6 py-4 flex gap-3 ${
              isDark ? 'bg-[#111113]/40 backdrop-blur-md border-white/10' : 'bg-white border-black/[0.08]'
            }`}>
              <button
                onClick={resetAllFilters}
                className={`flex-1 py-3.5 rounded-2xl text-[15px] font-semibold transition-colors ${
                  isDark
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] text-white'
                    : 'border border-[#cfd2d8] bg-white hover:bg-[#f3f4f6] text-[#111113] shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                }`}
              >
                Сбросить
              </button>
              <button
                onClick={applyDraftFilters}
                className={`flex-1 py-3.5 rounded-2xl transition-colors text-[15px] font-semibold ${
                  isDark
                    ? 'bg-white hover:bg-gray-200 text-[#111113]'
                    : 'bg-[#0a4f42] hover:bg-[#0a4f42]/90 text-white shadow-md shadow-[#0a4f42]/20'
                }`}
              >
                Применить
              </button>
            </div>
          </div>
        </>
      )}

      {!iconOnly && isOpen && (
        <div className={`mt-4 space-y-4 rounded-[20px] border p-4 ${isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-black/[0.08]'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="ID заказа"
              value={filters.searchId}
              onChange={(e) => onFilterChange('searchId', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
            <Input
              placeholder="Номер телефона"
              value={filters.searchPhone}
              onChange={(e) => onFilterChange('searchPhone', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
            <Input
              placeholder="Адрес"
              value={filters.searchAddress}
              onChange={(e) => onFilterChange('searchAddress', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
