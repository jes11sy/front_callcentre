'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  X,
  PhoneMissed,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CallFilters } from '@/types/telephony';
import { useForm } from 'react-hook-form';

interface QuickFiltersProps {
  // Quick filters state
  activeQuickFilter: 'all' | 'missed' | 'today' | 'answered';
  onQuickFilterChange: (filter: 'all' | 'missed' | 'today' | 'answered') => void;
  
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  
  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  
  // Advanced filters
  onFiltersSubmit: (data: CallFilters) => void;
  onClearFilters: () => void;
  
  // Stats
  totalCalls: number;
  missedCount?: number;
  
  // Form
  register: ReturnType<typeof useForm<CallFilters>>['register'];
  handleSubmit: ReturnType<typeof useForm<CallFilters>>['handleSubmit'];
  
  loading: boolean;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeQuickFilter,
  onQuickFilterChange,
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onFiltersSubmit,
  onClearFilters,
  totalCalls,
  missedCount,
  register,
  handleSubmit,
  loading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickFilters = [
    { id: 'all' as const, label: 'Все', icon: Phone },
    { id: 'missed' as const, label: 'Пропущенные', icon: PhoneMissed, count: missedCount },
    { id: 'today' as const, label: 'Сегодня', icon: Calendar },
    { id: 'answered' as const, label: 'Отвеченные', icon: Phone },
  ];

  return (
    <div className="space-y-4">
      {/* Верхняя панель: поиск + быстрые фильтры */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Поиск */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Поиск по номеру..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[#17212b] border-[#FFD700]/20 text-white placeholder:text-gray-500 focus:border-[#FFD700]"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Быстрые фильтры-чипы */}
        <div className="flex items-center gap-2 flex-wrap">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeQuickFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => onQuickFilterChange(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#FFD700] text-[#0f0f23]"
                    : "bg-[#17212b] text-gray-400 hover:text-white hover:bg-[#1a1a2e] border border-[#FFD700]/20"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
                {filter.count !== undefined && filter.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-1 h-5 min-w-[20px] text-xs",
                      isActive 
                        ? "bg-[#0f0f23]/20 text-[#0f0f23]" 
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {filter.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Кнопка расширенных фильтров */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "border-[#FFD700]/30 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10",
            showAdvanced && "bg-[#FFD700]/10 text-[#FFD700]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Фильтры
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>
      </div>

      {/* Расширенные фильтры */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border border-[#FFD700]/20 bg-[#17212b]/50 space-y-4">
          {/* Сортировка */}
          <div className="flex items-center gap-4">
            <Label className="text-sm text-gray-400 min-w-[80px]">Сортировка:</Label>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field] = value.split('-');
                onSortChange(field);
              }}
            >
              <SelectTrigger className="w-48 bg-[#0f0f23] border-[#FFD700]/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                <SelectItem value="dateCreate-desc" className="text-white focus:bg-[#FFD700]/20">
                  Дата (новые)
                </SelectItem>
                <SelectItem value="dateCreate-asc" className="text-white focus:bg-[#FFD700]/20">
                  Дата (старые)
                </SelectItem>
                <SelectItem value="city-asc" className="text-white focus:bg-[#FFD700]/20">
                  Город (А-Я)
                </SelectItem>
                <SelectItem value="city-desc" className="text-white focus:bg-[#FFD700]/20">
                  Город (Я-А)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Форма фильтров */}
          <form onSubmit={handleSubmit(onFiltersSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Дата с</Label>
                <Input
                  type="datetime-local"
                  {...register('dateFrom')}
                  className="bg-[#0f0f23] border-[#FFD700]/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Дата по</Label>
                <Input
                  type="datetime-local"
                  {...register('dateTo')}
                  className="bg-[#0f0f23] border-[#FFD700]/20 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Статус</Label>
                <Select onValueChange={(value) => register('status').onChange({ target: { value } })}>
                  <SelectTrigger className="bg-[#0f0f23] border-[#FFD700]/20 text-white">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    <SelectItem value="all" className="text-white focus:bg-[#FFD700]/20">Все</SelectItem>
                    <SelectItem value="answered" className="text-white focus:bg-[#FFD700]/20">Отвечен</SelectItem>
                    <SelectItem value="missed" className="text-white focus:bg-[#FFD700]/20">Пропущен</SelectItem>
                    <SelectItem value="busy" className="text-white focus:bg-[#FFD700]/20">Занято</SelectItem>
                    <SelectItem value="no_answer" className="text-white focus:bg-[#FFD700]/20">Нет ответа</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Город</Label>
                <Input
                  placeholder="Название города"
                  {...register('city')}
                  className="bg-[#0f0f23] border-[#FFD700]/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">РК</Label>
                <Input
                  placeholder="РК"
                  {...register('rk')}
                  className="bg-[#0f0f23] border-[#FFD700]/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Источник</Label>
                <Input
                  placeholder="Имя аккаунта"
                  {...register('avitoName')}
                  className="bg-[#0f0f23] border-[#FFD700]/20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#FFD700] hover:bg-[#FFC700] text-[#0f0f23] font-semibold"
              >
                Применить
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                onClick={onClearFilters}
                className="text-gray-400 hover:text-white"
              >
                Сбросить
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Статистика */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Всего звонков: <span className="text-white font-medium">{totalCalls}</span></span>
      </div>
    </div>
  );
};

QuickFilters.displayName = 'QuickFilters';
