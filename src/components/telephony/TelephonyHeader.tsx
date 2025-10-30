'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-end gap-2">
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
  );
};
