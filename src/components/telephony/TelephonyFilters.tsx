'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CallFilters } from '@/types/telephony';

interface TelephonyFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onFiltersSubmit: (data: CallFilters) => void;
  onClearFilters: () => void;
  loading: boolean;
  groupedCallsCount: number;
  totalCalls: number;
  register: ReturnType<typeof useForm<CallFilters>>['register'];
  handleSubmit: ReturnType<typeof useForm<CallFilters>>['handleSubmit'];
  errors: ReturnType<typeof useForm<CallFilters>>['formState']['errors'];
}

const TelephonyFiltersComponent: React.FC<TelephonyFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  sortBy,
  sortOrder,
  onSortChange,
  showFilters: _showFilters,
  onToggleFilters: _onToggleFilters,
  onFiltersSubmit,
  onClearFilters,
  loading,
  groupedCallsCount: _groupedCallsCount,
  totalCalls: _totalCalls,
  register,
  handleSubmit,
  errors: _errors
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
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

      {/* Раскрывающиеся фильтры */}
      {isOpen && (
        <div className="space-y-4 p-4 border border-[#FFD700]/20 rounded-lg bg-[#0f0f23]/50 mt-4">
          {/* Поиск и сортировка */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD700] h-4 w-4" />
              <Input
                placeholder="Поиск по телефону, РК, городу..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                className="pl-10 bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
              />
            </div>
            <Button 
              onClick={onSearch} 
              size="sm" 
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, _order] = value.split('-');
                onSortChange(field);
              }}
            >
              <SelectTrigger className="w-48 bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white shrink-0">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                <SelectItem value="dateCreate-desc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Дата звонка (новые)</SelectItem>
                <SelectItem value="dateCreate-asc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Дата звонка (старые)</SelectItem>
                <SelectItem value="city-asc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Город (А-Я)</SelectItem>
                <SelectItem value="city-desc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Город (Я-А)</SelectItem>
                <SelectItem value="rk-asc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">РК (А-Я)</SelectItem>
                <SelectItem value="rk-desc" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">РК (Я-А)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Дополнительные фильтры */}
          <form onSubmit={handleSubmit(onFiltersSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="text-gray-300">Дата с</Label>
                <Input
                  id="dateFrom"
                  type="datetime-local"
                  {...register('dateFrom')}
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-gray-300">Дата по</Label>
                <Input
                  id="dateTo"
                  type="datetime-local"
                  {...register('dateTo')}
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-300">Статус</Label>
                <Select onValueChange={(value) => register('status').onChange({ target: { value } })}>
                  <SelectTrigger className="bg-[#0f0f23] border-gray-600 text-white hover:border-[#FFD700]/50 focus:border-[#FFD700] [&>span]:text-white">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    <SelectItem value="all" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Все статусы</SelectItem>
                    <SelectItem value="answered" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Отвечен</SelectItem>
                    <SelectItem value="missed" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Пропущен</SelectItem>
                    <SelectItem value="busy" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Занято</SelectItem>
                    <SelectItem value="no_answer" className="!text-white focus:bg-[#FFD700]/20 focus:!text-white">Не отвечает</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city" className="text-gray-300">Город</Label>
                <Input
                  id="city"
                  placeholder="Название города"
                  {...register('city')}
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                />
              </div>
              <div>
                <Label htmlFor="rk" className="text-gray-300">РК</Label>
                <Input
                  id="rk"
                  placeholder="РК"
                  {...register('rk')}
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                />
              </div>
              <div>
                <Label htmlFor="avitoName" className="text-gray-300">Авито аккаунт</Label>
                <Input
                  id="avitoName"
                  placeholder="Имя аккаунта"
                  {...register('avitoName')}
                  className="bg-[#0f0f23] border-gray-600 text-white placeholder:text-gray-500 hover:border-[#FFD700]/50 focus:border-[#FFD700]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
              >
                Применить фильтры
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClearFilters} 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Очистить
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

TelephonyFiltersComponent.displayName = 'TelephonyFilters';

export const TelephonyFilters = React.memo(TelephonyFiltersComponent);
