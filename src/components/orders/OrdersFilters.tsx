'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { OrderFilters } from '@/types/orders';
import { STATUS_OPTIONS } from '@/constants/orders';

interface OrdersFiltersProps {
  filters: OrderFilters;
  onFilterChange: (key: keyof OrderFilters, value: string) => void;
}

export const OrdersFilters = ({ filters, onFilterChange }: OrdersFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 mb-8 w-full">
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="p-6">
          {/* Поиск и кнопка фильтра */}
          <div className="flex items-center gap-4">
            {/* Поиск */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD700] h-4 w-4" />
              <Input
                placeholder="Поиск по ID, номеру телефона или адресу..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10 bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
              />
            </div>
            
            {/* Кнопка фильтров */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 hover:text-[#FFD700] min-w-[140px]"
            >
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
              {isOpen ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Раскрывающиеся фильтры */}
          {isOpen && (
            <div className="mt-6 pt-6 border-t border-[#FFD700]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">Статус</Label>
                  <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                    <SelectTrigger className="bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white">
                      <SelectValue placeholder="Все статусы" className="text-white placeholder:text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#17212b] border-[#FFD700]/30 [&>*]:text-white">
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value} 
                          className="!text-white focus:bg-[#FFD700]/20 focus:!text-white data-[highlighted]:bg-[#FFD700]/20 data-[highlighted]:text-white"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-300">Город</Label>
                  <Input
                    id="city"
                    placeholder="Фильтр по городу"
                    value={filters.city}
                    onChange={(e) => onFilterChange('city', e.target.value)}
                    className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="master" className="text-gray-300">Мастер</Label>
                  <Input
                    id="master"
                    placeholder="Поиск по мастеру"
                    value={filters.master}
                    onChange={(e) => onFilterChange('master', e.target.value)}
                    className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="closingDate" className="text-gray-300">Дата закрытия</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={filters.closingDate}
                    onChange={(e) => onFilterChange('closingDate', e.target.value)}
                    className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700] [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
