'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  X,
  Phone,
  PhoneMissed,
  PhoneIncoming,
  Calendar,
  Clock
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
      count: counts.all,
      color: 'text-gray-300',
      activeColor: 'bg-[#FFD700] text-[#0f0f23]',
      activeBorder: 'border-[#FFD700]'
    },
    { 
      id: 'missed' as const, 
      label: 'Пропущенные', 
      icon: PhoneMissed, 
      count: counts.missed,
      color: 'text-red-400',
      activeColor: 'bg-red-500/90 text-white',
      activeBorder: 'border-red-500',
      highlight: counts.missed > 0
    },
    { 
      id: 'answered' as const, 
      label: 'Отвеченные', 
      icon: PhoneIncoming, 
      count: counts.answered,
      color: 'text-gray-300',
      activeColor: 'bg-[#FFD700] text-[#0f0f23]',
      activeBorder: 'border-[#FFD700]'
    },
    { 
      id: 'today' as const, 
      label: 'Сегодня', 
      icon: Calendar, 
      count: counts.today,
      color: 'text-gray-300',
      activeColor: 'bg-[#FFD700] text-[#0f0f23]',
      activeBorder: 'border-[#FFD700]'
    },
    { 
      id: 'last_hour' as const, 
      label: 'Последний час', 
      icon: Clock, 
      count: null,
      color: 'text-gray-300',
      activeColor: 'bg-[#FFD700] text-[#0f0f23]',
      activeBorder: 'border-[#FFD700]'
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Поиск по номеру..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-48 pl-9 h-9 bg-[#0f0f23] border-[#FFD700]/20 text-white placeholder:text-gray-500 focus:border-[#FFD700]"
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

      {/* Разделитель */}
      <div className="w-px h-6 bg-[#FFD700]/20" />

      {/* Фильтры-чипы */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                "border",
                isActive
                  ? cn(filter.activeColor, filter.activeBorder, "shadow-lg shadow-[#FFD700]/20")
                  : cn(
                      "bg-[#17212b] border-[#FFD700]/20",
                      filter.color,
                      "hover:border-[#FFD700]/50 hover:bg-[#1a1a2e]",
                      filter.highlight && "border-red-500/50 animate-pulse"
                    )
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{filter.label}</span>
              {filter.count !== null && filter.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-0.5 h-5 min-w-[20px] text-xs font-bold",
                    isActive 
                      ? filter.id === 'missed' 
                        ? "bg-white/30 text-white" 
                        : "bg-[#0f0f23]/30 text-[#0f0f23]"
                      : filter.id === 'missed' && filter.count > 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-[#FFD700]/10 text-[#FFD700]/70"
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
          <div className="w-px h-6 bg-[#FFD700]/20" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Поиск:</span>
            <Badge 
              variant="outline" 
              className="border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/10"
            >
              {searchTerm}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-white"
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
