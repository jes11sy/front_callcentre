'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { OrderFilters } from '@/types/orders';
import { STATUS_OPTIONS } from '@/constants/orders';
import { useCities } from '@/hooks/useStaticData';
interface OrdersFiltersProps {
  filters: OrderFilters;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
<<<<<<< Updated upstream
  onReset?: () => void;
}

export const OrdersFilters = ({ filters, onFilterChange, onReset }: OrdersFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: cities = [] } = useCities();

  const hasActiveFilters = !!(
    filters.searchId || filters.searchPhone || filters.searchAddress ||
    (filters.status && filters.status !== 'all') || filters.cityId ||
    filters.master || filters.closingDate
  );

  return (
    <div className="w-full font-myriad">
      {/* Кнопки управления фильтрами */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full sm:w-auto justify-center bg-white dark:bg-[#252d3a] border text-gray-700 dark:text-gray-200 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004] min-w-[120px] sm:min-w-[140px] ${
            hasActiveFilters
              ? 'border-[#FEC004] text-[#FEC004]'
              : 'border-gray-200 dark:border-gray-600'
          }`}
        >
          <Filter className="mr-2 h-4 w-4" />
          Фильтры
          {hasActiveFilters && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#FEC004]" />}
          {isOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
        {hasActiveFilters && onReset && (
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
=======
  iconOnly?: boolean;
}

export const OrdersFilters = ({ filters, onFilterChange, iconOnly = false }: OrdersFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: citiesData } = useCities();
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  
  // Получаем список городов из ответа API
  const cities: string[] = citiesData?.data || citiesData || [];

  return (
    <div className={`font-myriad ${iconOnly ? 'relative w-auto' : 'w-full'}`}>
      {/* Кнопка фильтров */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`justify-center border shadow-none ${
          iconOnly
            ? `h-10 w-10 rounded-xl p-0 border-transparent ${isDark ? 'bg-transparent text-white hover:bg-white/[0.08]' : 'bg-transparent text-gray-700 hover:bg-black/[0.03]'}`
            : `w-full sm:w-auto min-w-[120px] sm:min-w-[140px] rounded-full ${
                isDark
                  ? 'bg-white/[0.04] border-white/15 text-white hover:bg-white/[0.08]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-black/[0.03] hover:border-gray-300'
              }`
        }`}
        title="Фильтры"
        aria-label="Фильтры"
      >
        <Filter className="h-4 w-4" />
        {!iconOnly && 'Фильтры'}
        {!iconOnly && (isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />)}
      </Button>
>>>>>>> Stashed changes

      {/* Раскрывающиеся фильтры */}
      {isOpen && (
        <div className={`${iconOnly ? 'absolute right-0 top-[calc(100%+10px)] z-50 w-[min(980px,calc(100vw-2rem))]' : 'mt-4'} space-y-4 rounded-[20px] border p-4 ${isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-black/[0.08]'}`}>
          {/* Поиск - 3 отдельных поля */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Поиск по ID */}
            <Input
              placeholder="ID заказа"
              value={filters.searchId}
              onChange={(e) => onFilterChange('searchId', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark
                  ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />

            {/* Поиск по телефону */}
            <Input
              placeholder="Номер телефона"
              value={filters.searchPhone}
              onChange={(e) => onFilterChange('searchPhone', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark
                  ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />

            {/* Поиск по адресу */}
            <Input
              placeholder="Адрес"
              value={filters.searchAddress}
              onChange={(e) => onFilterChange('searchAddress', e.target.value)}
              className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                isDark
                  ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>

          {/* Остальные фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-600 dark:text-gray-400">Статус</Label>
              <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                <SelectTrigger className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-white data-[placeholder]:text-white/45 [&_svg]:text-white/60'
                    : 'bg-white border-gray-200 text-gray-900 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500'
                }`}>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-gray-200'}>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value} 
                      className={isDark ? 'text-white data-[highlighted]:bg-white/10' : 'text-gray-700 data-[highlighted]:bg-black/5'}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-600 dark:text-gray-400">Город</Label>
<<<<<<< Updated upstream
              <Select value={filters.cityId || 'all'} onValueChange={(value) => onFilterChange('cityId', value === 'all' ? '' : value)}>
                <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 hover:border-[#FEC004]/50 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
=======
              <Select value={filters.city || 'all'} onValueChange={(value) => onFilterChange('city', value === 'all' ? '' : value)}>
                <SelectTrigger className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-white data-[placeholder]:text-white/45 [&_svg]:text-white/60'
                    : 'bg-white border-gray-200 text-gray-900 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500'
                }`}>
>>>>>>> Stashed changes
                  <SelectValue placeholder="Все города" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-gray-200'}>
                  <SelectItem 
                    value="all" 
                    className={isDark ? 'text-white data-[highlighted]:bg-white/10' : 'text-gray-700 data-[highlighted]:bg-black/5'}
                  >
                    Все города
                  </SelectItem>
                  {cities.map((city) => (
                    <SelectItem 
<<<<<<< Updated upstream
                      key={city.id} 
                      value={city.id.toString()} 
                      className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
=======
                      key={city} 
                      value={city} 
                      className={isDark ? 'text-white data-[highlighted]:bg-white/10' : 'text-gray-700 data-[highlighted]:bg-black/5'}
>>>>>>> Stashed changes
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
                value={filters.master}
                onChange={(e) => onFilterChange('master', e.target.value)}
                className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingDate" className="text-gray-600 dark:text-gray-400">Дата закрытия</Label>
              <Input
                id="closingDate"
                type="date"
                value={filters.closingDate}
                onChange={(e) => onFilterChange('closingDate', e.target.value)}
                className={`outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 dark:[color-scheme:dark] ${
                  isDark
                    ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-white/45'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
