'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Order } from '@/types/orders';
import { TIME_SLOTS, EQUIPMENT_TYPE_COLORS } from '@/constants/orders';
import React, { useCallback } from 'react';

interface TimeSlotsTableProps {
  orders: Order[];
}

const TimeSlotsTableComponent = ({ orders }: TimeSlotsTableProps) => {
  // Мемоизированная функция для подсчета заказов в временном слоте
  const getOrdersForTimeSlot = useCallback((hour: number, minute: number, typeEquipment: string) => {
    return orders.filter(order => {
      if (!order.dateMeeting || order.typeEquipment !== typeEquipment) return false;
      const orderTime = new Date(order.dateMeeting);
      const today = new Date();
      
      // Проверяем, что заявка на сегодня (используем UTC для корректного сравнения)
      const isToday = orderTime.getUTCDate() === today.getDate() && 
                     orderTime.getUTCMonth() === today.getMonth() && 
                     orderTime.getUTCFullYear() === today.getFullYear();
      
      if (!isToday) return false;
      
      const orderHour = orderTime.getUTCHours();
      const orderMinute = orderTime.getUTCMinutes();
      return orderHour === hour && orderMinute === minute;
    }).length;
  }, [orders]);

  // Мемоизированная функция рендера строки временных слотов
  const renderTimeSlotRow = useCallback((typeEquipment: string, label: string, colorClass: string) => {
    return (
      <div className="grid gap-2 min-w-max grid-time-slots">
        <div className={`text-sm font-medium ${colorClass} text-center`}>{label}</div>
        {TIME_SLOTS.map(({ hour, minute, index: _index }) => {
          const count = getOrdersForTimeSlot(hour, minute, typeEquipment);
          
          return (
            <div key={`${typeEquipment}-${_index}`} className="text-center">
              <div className={`text-lg font-bold ${
                count > 0 ? colorClass : 'text-gray-600'
              }`}>
                {count}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [getOrdersForTimeSlot]);

  return (
    <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#FFD700]">
          <Clock className="h-5 w-5" />
          Заявки на сегодня по времени
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="space-y-4">
            {/* Header with time slots */}
            <div className="grid gap-2 min-w-max grid-time-slots">
              <div className="text-sm font-medium text-gray-300 text-center">Время</div>
              {TIME_SLOTS.map(({ timeString, index: _index }) => (
                <div key={timeString} className="text-sm font-medium text-gray-300 text-center">
                  {timeString}
                </div>
              ))}
            </div>
            
            {/* Equipment type rows */}
            {renderTimeSlotRow('КП', 'КП', EQUIPMENT_TYPE_COLORS['КП'])}
            {renderTimeSlotRow('БТ', 'БТ', EQUIPMENT_TYPE_COLORS['БТ'])}
            {renderTimeSlotRow('МНЧ', 'МНЧ', EQUIPMENT_TYPE_COLORS['МНЧ'])}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

TimeSlotsTableComponent.displayName = 'TimeSlotsTable';

export const TimeSlotsTable = React.memo(TimeSlotsTableComponent);
