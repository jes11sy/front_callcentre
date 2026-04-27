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
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CallFilters } from '@/types/telephony';
import { useDesignStore } from '@/store/designStore';
import { getFormDateFieldClass, getFormFieldClass, getFormSelectContentClass, getFormSelectItemClass, getFormSelectTriggerClass } from '@/components/ui/form-styles';

interface TelephonyFiltersProps {
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
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const fieldClass = getFormFieldClass(isDark, 'sm');
  const dateFieldClass = getFormDateFieldClass(isDark, 'sm');
  const triggerClass = getFormSelectTriggerClass(isDark, 'sm');
  const contentClass = getFormSelectContentClass(isDark);
  const itemClass = getFormSelectItemClass(isDark);

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
          {/* Сортировка */}
          <div className="flex items-center gap-2">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, _order] = value.split('-');
                onSortChange(field);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent className={contentClass}>
                <SelectItem value="createdAt-desc" className={itemClass}>Дата звонка (новые)</SelectItem>
                <SelectItem value="createdAt-asc" className={itemClass}>Дата звонка (старые)</SelectItem>
                <SelectItem value="city-asc" className={itemClass}>Город (А-Я)</SelectItem>
                <SelectItem value="city-desc" className={itemClass}>Город (Я-А)</SelectItem>
                <SelectItem value="rk-asc" className={itemClass}>РК (А-Я)</SelectItem>
                <SelectItem value="rk-desc" className={itemClass}>РК (Я-А)</SelectItem>
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
                  className={dateFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-gray-300">Дата по</Label>
                <Input
                  id="dateTo"
                  type="datetime-local"
                  {...register('dateTo')}
                  className={dateFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-300">Статус</Label>
                <Select onValueChange={(value) => register('status').onChange({ target: { value } })}>
                  <SelectTrigger className={triggerClass}>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className={contentClass}>
                    <SelectItem value="all" className={itemClass}>Все статусы</SelectItem>
                    <SelectItem value="answered" className={itemClass}>Отвечен</SelectItem>
                    <SelectItem value="missed" className={itemClass}>Пропущен</SelectItem>
                    <SelectItem value="busy" className={itemClass}>Занято</SelectItem>
                    <SelectItem value="no_answer" className={itemClass}>Не отвечает</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cityId" className="text-gray-300">ID Города</Label>
                <Input
                  id="cityId"
                  placeholder="ID города"
                  {...register('cityId')}
                  className={fieldClass}
                />
              </div>
              <div>
                <Label htmlFor="rkId" className="text-gray-300">ID РК</Label>
                <Input
                  id="rkId"
                  placeholder="ID рекламной кампании"
                  {...register('rkId')}
                  className={fieldClass}
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
