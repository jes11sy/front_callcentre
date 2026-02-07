'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
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
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  
  // Получаем список городов из ответа API
  const cities: string[] = citiesData?.data || citiesData || [];

  return (
    <div className={`w-full ${isV2 ? 'font-myriad' : ''}`}>
      {/* Кнопка фильтров */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto ${isV2 
          ? "bg-white dark:bg-[#252d3a] border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-[#FEC004]/10 hover:text-[#FEC004] hover:border-[#FEC004] min-w-[120px] sm:min-w-[140px]"
          : "bg-[#0f0f23] border border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50 min-w-[120px] sm:min-w-[140px]"
        }`}
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
        <div className={isV2 
          ? "space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e2530] mt-4"
          : "space-y-4 p-4 border border-[#FFD700]/20 rounded-lg bg-[#0f0f23]/50 mt-4"
        }>
          {/* Поиск */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isV2 ? 'text-gray-400' : 'text-[#FFD700]'}`} />
            <Input
              placeholder="Поиск по ID, номеру телефона или адресу..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={isV2 
                ? "pl-10 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
                : "pl-10 bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
              }
            />
          </div>

          {/* Остальные фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className={isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}>Статус</Label>
              <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                <SelectTrigger className={isV2 
                  ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 hover:border-[#FEC004]/50 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0"
                  : "bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white"
                }>
                  <SelectValue placeholder="Все статусы" className={isV2 ? "" : "text-white placeholder:text-white"} />
                </SelectTrigger>
                <SelectContent className={isV2 ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600" : "bg-[#17212b] border-[#FFD700]/30 [&>*]:text-white"}>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value} 
                      className={isV2 
                        ? "text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                        : "!text-white focus:bg-[#FFD700]/20 focus:!text-white data-[highlighted]:bg-[#FFD700]/20 data-[highlighted]:text-white"
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" className={isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}>Город</Label>
              <Select value={filters.city || 'all'} onValueChange={(value) => onFilterChange('city', value === 'all' ? '' : value)}>
                <SelectTrigger className={isV2 
                  ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 data-[placeholder]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 hover:border-[#FEC004]/50 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0"
                  : "bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white"
                }>
                  <SelectValue placeholder="Все города" />
                </SelectTrigger>
                <SelectContent className={isV2 ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600" : "bg-[#17212b] border-[#FFD700]/30 [&>*]:text-white"}>
                  <SelectItem 
                    value="all" 
                    className={isV2 
                      ? "text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                      : "!text-white focus:bg-[#FFD700]/20 focus:!text-white data-[highlighted]:bg-[#FFD700]/20 data-[highlighted]:text-white"
                    }
                  >
                    Все города
                  </SelectItem>
                  {cities.map((city: string) => (
                    <SelectItem 
                      key={city} 
                      value={city} 
                      className={isV2 
                        ? "text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100"
                        : "!text-white focus:bg-[#FFD700]/20 focus:!text-white data-[highlighted]:bg-[#FFD700]/20 data-[highlighted]:text-white"
                      }
                    >
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="master" className={isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}>Мастер</Label>
              <Input
                id="master"
                placeholder="Поиск по мастеру"
                value={filters.master}
                onChange={(e) => onFilterChange('master', e.target.value)}
                className={isV2 
                  ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20"
                  : "bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingDate" className={isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}>Дата закрытия</Label>
              <Input
                id="closingDate"
                type="date"
                value={filters.closingDate}
                onChange={(e) => onFilterChange('closingDate', e.target.value)}
                className={isV2 
                  ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-[#FEC004]/20 dark:[color-scheme:dark]"
                  : "bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700] [color-scheme:dark]"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
