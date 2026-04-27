'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDesignStore } from '@/store/designStore';
import { 
  Search, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFormFieldClass } from '@/components/ui/form-styles';

interface QuickFilterChipsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  searchTerm,
  onSearchChange
}) => {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const searchFieldClass = `${getFormFieldClass(isDark, 'sm')} h-9`;

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
          className={`${searchFieldClass} w-full rounded-2xl pl-9`}
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

      {/* Активный фильтр поиска */}
      {searchTerm && (
        <>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Поиск:</span>
            <Badge 
              variant="outline" 
              className={isDark ? "border-white/20 text-white bg-white/10" : "border-[#0a4f42]/20 text-[#0a4f42] bg-[#0a4f42]/10"}
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
