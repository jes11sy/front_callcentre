'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { Order } from '@/types/orders';
import { TIME_SLOTS, EQUIPMENT_TYPE_COLORS } from '@/constants/orders';
import React, { useCallback, useMemo, useState } from 'react';

interface TimeSlotsTableProps {
  orders: Order[];
}

// Статусы, которые учитываются во временной шкале
const ACTIVE_STATUSES = ['Ожидает', 'Принял', 'В пути'];

const TimeSlotsTableComponent = ({ orders }: TimeSlotsTableProps) => {
  const [activeCity, setActiveCity] = useState<string>('all');

  // Фильтруем заказы только с активными статусами
  const activeOrders = useMemo(() => {
    return orders.filter(order => ACTIVE_STATUSES.includes(order.statusOrder));
  }, [orders]);

  // Получаем уникальные города из заказов на сегодня
  const cities = useMemo(() => {
    const today = new Date();
    const citySet = new Set<string>();
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting || !order.city) return;
      const orderTime = new Date(order.dateMeeting);
      
      const isToday = orderTime.getUTCDate() === today.getDate() && 
                     orderTime.getUTCMonth() === today.getMonth() && 
                     orderTime.getUTCFullYear() === today.getFullYear();
      
      if (isToday) {
        citySet.add(order.city);
      }
    });
    
    return Array.from(citySet).sort();
  }, [activeOrders]);

  // Подсчёт заказов на сегодня по городам
  const cityCounts = useMemo(() => {
    const today = new Date();
    const counts: Record<string, number> = { all: 0 };
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting) return;
      const orderTime = new Date(order.dateMeeting);
      
      const isToday = orderTime.getUTCDate() === today.getDate() && 
                     orderTime.getUTCMonth() === today.getMonth() && 
                     orderTime.getUTCFullYear() === today.getFullYear();
      
      if (isToday) {
        counts.all = (counts.all || 0) + 1;
        if (order.city) {
          counts[order.city] = (counts[order.city] || 0) + 1;
        }
      }
    });
    
    return counts;
  }, [activeOrders]);

  // Фильтрованные заказы по выбранному городу
  const filteredOrders = useMemo(() => {
    if (activeCity === 'all') return activeOrders;
    return activeOrders.filter(order => order.city === activeCity);
  }, [activeOrders, activeCity]);

  // Мемоизированная функция для подсчета заказов в временном слоте
  const getOrdersForTimeSlot = useCallback((hour: number, minute: number, typeEquipment: string) => {
    return filteredOrders.filter(order => {
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
  }, [filteredOrders]);

  // Подсчёт итогов по типу техники
  const getEquipmentTotal = useCallback((typeEquipment: string) => {
    const today = new Date();
    return filteredOrders.filter(order => {
      if (!order.dateMeeting || order.typeEquipment !== typeEquipment) return false;
      const orderTime = new Date(order.dateMeeting);
      
      const isToday = orderTime.getUTCDate() === today.getDate() && 
                     orderTime.getUTCMonth() === today.getMonth() && 
                     orderTime.getUTCFullYear() === today.getFullYear();
      
      return isToday;
    }).length;
  }, [filteredOrders]);

  // Мемоизированная функция рендера строки временных слотов
  const renderTimeSlotRow = useCallback((typeEquipment: string, label: string, colorClass: string) => {
    const total = getEquipmentTotal(typeEquipment);
    
    return (
      <div className="grid gap-2 min-w-max grid-time-slots-with-total">
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
        <div className={`text-lg font-bold ${colorClass} text-center border-l border-[#FFD700]/20 pl-2`}>
          {total}
        </div>
      </div>
    );
  }, [getOrdersForTimeSlot, getEquipmentTotal]);

  return (
    <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[#FFD700]">
          <Clock className="h-5 w-5" />
          Активные заявки на сегодня
          <span className="text-sm font-normal text-gray-400 ml-2">
            (Ожидает, Принял, В пути)
          </span>
        </CardTitle>
        
        {/* Табы городов */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setActiveCity('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCity === 'all'
                ? 'bg-[#FFD700] text-[#02111B]'
                : 'bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Все города
            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
              activeCity === 'all' ? 'bg-[#02111B]/20' : 'bg-[#FFD700]/20 text-[#FFD700]'
            }`}>
              {cityCounts.all || 0}
            </span>
          </button>
          
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCity === city
                  ? 'bg-[#FFD700] text-[#02111B]'
                  : 'bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30'
              }`}
            >
              {city}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeCity === city ? 'bg-[#02111B]/20' : 'bg-[#FFD700]/20 text-[#FFD700]'
              }`}>
                {cityCounts[city] || 0}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="space-y-4">
            {/* Header with time slots */}
            <div className="grid gap-2 min-w-max grid-time-slots-with-total">
              <div className="text-sm font-medium text-gray-300 text-center">Тип</div>
              {TIME_SLOTS.map(({ timeString }) => (
                <div key={timeString} className="text-sm font-medium text-gray-300 text-center">
                  {timeString}
                </div>
              ))}
              <div className="text-sm font-medium text-[#FFD700] text-center border-l border-[#FFD700]/20 pl-2">
                Итого
              </div>
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
