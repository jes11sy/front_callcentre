'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface Order {
  id: number;
  clientName: string;
  cityId?: number;
  city?: { id: number; name: string };
  statusId?: number;
  status?: { id: number; name: string; code: string };
  dateMeeting: string;
  equipmentTypeId?: number;
  equipmentType?: { id: number; name: string };
  typeOrder?: string;
  createdAt: string;
  rkId?: number;
  rk?: { id: number; name: string };
  address?: string;
  result?: number;
  master?: { id: number; name: string };
}

interface OrderHistoryPanelProps {
  orderHistory: Order[];
  loading: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const OrderHistoryPanel = React.memo(({
  orderHistory,
  loading,
  isOpen,
  onToggle,
}: OrderHistoryPanelProps) => (
  <div className="flex-1 overflow-hidden flex flex-col">
    <button
      onClick={onToggle}
      className="w-full px-3 py-2.5 sm:py-2 flex items-center justify-between text-xs sm:text-sm lg:text-xs font-medium transition-colors shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        <span>История заказов ({orderHistory.length})</span>
      </div>
      {isOpen ? <ChevronUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <ChevronDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
    </button>
    {isOpen && (
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              Заказов не найдено
            </div>
          ) : (
            orderHistory.map((order) => (
              <div key={order.id} className="p-2.5 rounded-lg text-xs space-y-1.5 bg-gray-50 dark:bg-[#252d3a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">#{order.id}</span>
                    {order.typeOrder && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                        {order.typeOrder}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                    {order.status?.name || 'Нет статуса'}
                  </Badge>
                </div>

                {order.rk?.name && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{order.rk.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="truncate text-gray-700 dark:text-gray-300">{order.clientName}</span>
                </div>

                {order.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="truncate text-gray-500 dark:text-gray-400">{order.address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <span>Мастер:</span>
                    <span className="text-gray-700 dark:text-gray-300">{order.master?.name || '—'}</span>
                  </div>
                  {order.result !== undefined && order.result !== null && (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.result.toLocaleString('ru-RU')} ₽</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/orders?orderId=${order.id}`, '_blank')}
                  className="w-full mt-2 h-6 text-[10px] text-[#FEC004] border-[#FEC004]/30 hover:bg-[#FEC004]/10 hover:border-[#FEC004]"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Открыть заказ
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    )}
  </div>
));

OrderHistoryPanel.displayName = 'OrderHistoryPanel';
