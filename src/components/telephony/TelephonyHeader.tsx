'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

interface TelephonyHeaderProps {
  newCallsCount: number;
  onNewCallsCountReset: () => void;
  onManualRefresh: () => void;
  loading: boolean;
}

export const TelephonyHeader: React.FC<TelephonyHeaderProps> = ({
  newCallsCount,
  onNewCallsCountReset,
  onManualRefresh,
  loading
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div>
          <div className="flex items-center gap-3">
            {newCallsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="animate-pulse cursor-pointer bg-red-500/20 text-red-400 border-red-500/30"
                onClick={onNewCallsCountReset}
              >
                +{newCallsCount} новых
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onManualRefresh}
          disabled={loading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Обновить
        </Button>
      </div>
    </div>
  );
};
