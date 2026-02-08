'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { OrderFilters } from '@/types/orders';
import { STATUS_OPTIONS } from '@/constants/orders';
import { useCities } from '@/hooks/useStaticData';
import { useDesignStore } from '@/store/designStore';

interface OrdersFiltersProps {
  filters: OrderFilters;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
}

export const OrdersFilters = ({ filters, onFilterChange }: OrdersFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: citiesData } = useCities();
  const { theme } = useDesignStore();
  
  // Получаем список городов из ответа API
  const cities: string[] = citiesData?.data || citiesData || [];

  return (
    <div className="w-full font-myriad">
      {/* Кнопка фильтров */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto justify-center bg-white dark:bg-[#252d3a] border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004] min-w-[120px] sm:min-w-[140px]"
      >
        <Filter className="mr-2 h-4 w-4" />
        Фильтры
        {isOpen ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>

      {/* Раскрывающиеся фильтры */}
      {isOpen && (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e2530] mt-4">
          {/* Поиск - 3 отдельных поля */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Поиск по ID */}
            <Input
              placeholder="ID заказа"
              value={filters.searchId}
              onChange={(e) => onFilterChange('searchId', e.target.value)}
              className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
            />

            {/* Поиск по телефону */}
            <Input
              placeholder="Номер телефона"
              value={filters.searchPhone}
              onChange={(e) => onFilterChange('searchPhone', e.target.value)}
              className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
            />

            {/* Поиск по адресу */}
            <Input
              placeholder="Адрес"
              value={filters.searchAddress}
              onChange={(e) => onFilterChange('searchAddress', e.target.value)}
              className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
            />
          </div>

          {/* Остальные фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-600 dark:text-gray-400">Статус</Label>
              <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 hover:border-[#FEC004]/50 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value} 
                      className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-600 dark:text-gray-400">Город</Label>
              <Select value={filters.city || 'all'} onValueChange={(value) => onFilterChange('city', value === 'all' ? '' : value)}>
                <SelectTrigger className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 hover:border-[#FEC004]/50 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Все города" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                  <SelectItem 
                    value="all" 
                    className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                  >
                    Все города
                  </SelectItem>
                  {cities.map((city: string) => (
                    <SelectItem 
                      key={city} 
                      value={city} 
                      className="text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                    >
                      {city}
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
                className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingDate" className="text-gray-600 dark:text-gray-400">Дата закрытия</Label>
              <Input
                id="closingDate"
                type="date"
                value={filters.closingDate}
                onChange={(e) => onFilterChange('closingDate', e.target.value)}
                  className="bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20 dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
