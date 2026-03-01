'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Loader2 
} from 'lucide-react';
import { Call } from '@/types/telephony';

interface OrderHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCall: Call | null;
  orderHistory: unknown[];
  orderHistoryLoading: boolean;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  open,
  onOpenChange,
  selectedCall,
  orderHistory,
  orderHistoryLoading
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Ожидает': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Принял': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'В пути': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'В работе': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Готово': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Отказ': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Модерн': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Незаказ': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-[#0f0f23] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FFD700]">
            <span className="text-2xl">📞</span>
            История заказов
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-gray-400">
            Заказы для номера телефона
            {selectedCall && (
              <Badge variant="outline" className="text-xs font-mono border-[#FFD700]/30 text-[#FFD700]">
                {selectedCall.phoneClient}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {orderHistoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
              <span className="ml-2 text-gray-300">Загрузка заказов...</span>
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <FileText className="h-12 w-12 mb-4 text-gray-600" />
              <p className="text-lg font-medium">Нет заказов</p>
              <p className="text-sm">Для этого номера телефона еще не создано ни одного заказа</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {orderHistory.map((order: unknown, _index: number) => {
                  const orderData = order as {
                    id: string;
                    status?: { id: number; name: string; code: string };
                    clientName: string;
                    phone: string;
                    cityId?: number;
                    city?: { id: number; name: string };
                    equipmentTypeId?: number;
                    equipmentType?: { id: number; name: string };
                    dateMeeting: string;
                    operator?: { name?: string };
                    comment?: string;
                    address?: string;
                    rkId?: number;
                    rk?: { id: number; name: string };
                  };
                  const orderStatusName = orderData.status?.name || '';
                  return (
                  <Card key={orderData.id} className="border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-colors bg-[#17212b]">
                    <CardContent className="p-4">
                      {/* Header with ID and Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs border-[#FFD700]/30 text-[#FFD700]">
                            #{orderData.id}
                          </Badge>
                          <Badge 
                            className={`text-xs font-medium ${getStatusBadge(orderStatusName)}`}
                          >
                            {orderStatusName || 'Нет статуса'}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            window.open(`/orders?orderId=${orderData.id}`, '_blank');
                          }}
                          className="text-[#FFD700] border-[#FFD700]/30 hover:bg-[#FFD700]/10 hover:border-[#FFD700] h-7 px-2 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Открыть
                        </Button>
                      </div>

                      {/* Client Information */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-base text-white mb-1">{orderData.clientName}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {orderData.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {orderData.city?.name || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Тип</p>
                          <p className="font-semibold text-white text-sm">
                            {orderData.equipmentType?.name || '—'}
                          </p>
                        </div>
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Дата</p>
                          <p className="font-semibold text-white text-sm">
                            {new Date(orderData.dateMeeting).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'UTC'
                            })}
                          </p>
                        </div>
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Оператор</p>
                          <p className="font-semibold text-white text-sm">{orderData.operator?.name || 'Не указан'}</p>
                        </div>
                      </div>

                      {orderData.comment && (
                      <div className="bg-[#FFD700]/10 rounded p-2 border-l-2 border-[#FFD700]">
                        <p className="text-xs font-medium text-[#FFD700] uppercase tracking-wide mb-1">Комментарий</p>
                        <p className="text-xs text-gray-300">{orderData.comment}</p>
                      </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
