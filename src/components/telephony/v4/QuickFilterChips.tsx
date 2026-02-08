'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  X,
  Phone,
  PhoneMissed
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuickFilter = 'all' | 'missed' | 'answered' | 'today' | 'last_hour';

interface QuickFilterChipsProps {
  activeFilter: QuickFilter;
  onFilterChange: (filter: QuickFilter) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  counts: {
    all: number;
    missed: number;
    answered: number;
    today: number;
  };
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  counts
}) => {
  const filters = [
    { 
      id: 'all' as const, 
      label: 'Все', 
      icon: Phone, 
      count: counts.all
    },
    { 
      id: 'missed' as const, 
      label: 'Пропущенные', 
      icon: PhoneMissed, 
      count: counts.missed,
      highlight: counts.missed > 0
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Поиск */}
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Поиск по номеру..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-48 pl-9 h-8 sm:h-9 text-sm bg-[#F3F3EE] dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-[#FEC004] focus-visible:ring-[#FEC004]/30"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Разделитель - скрыт на мобильных */}
      <div className="w-px h-6 hidden sm:block bg-gray-200 dark:bg-gray-600" />

      {/* Фильтры-чипы */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
                "border",
                isActive
                  ? filter.id === 'missed'
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-[#FEC004] text-gray-900 border-[#FEC004]"
                  : cn(
                      "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300",
                      "hover:border-[#FEC004] hover:text-[#FEC004]",
                      filter.highlight && "border-red-300 dark:border-red-500/50 text-red-500"
                    )
              )}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{filter.label}</span>
              {filter.count !== null && filter.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-0.5 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] text-[10px] sm:text-xs font-bold",
                    isActive 
                      ? filter.id === 'missed'
                        ? "bg-white/30 text-white"
                        : "bg-gray-900/20 text-gray-900"
                      : filter.id === 'missed' && filter.count > 0
                        ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {filter.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Активный фильтр поиска */}
      {searchTerm && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Поиск:</span>
            <Badge 
              variant="outline" 
              className="border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/10"
            >
              {searchTerm}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        </>
      )}
    </div>
  );
};

QuickFilterChips.displayName = 'QuickFilterChips';
