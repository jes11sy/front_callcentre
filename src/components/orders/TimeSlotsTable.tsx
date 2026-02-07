'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '@/types/orders';
import { TIME_SLOTS, EQUIPMENT_TYPE_COLORS } from '@/constants/orders';
import React, { useCallback, useMemo, useState } from 'react';
import { useDesignStore } from '@/store/designStore';

const EQUIPMENT_TYPE_COLORS_V2 = {
  'КП': 'text-gray-700 dark:text-gray-300',
  'БТ': 'text-gray-700 dark:text-gray-300',
  'МНЧ': 'text-gray-700 dark:text-gray-300'
} as const;

interface TimeSlotsTableProps {
  orders: Order[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onCityClick?: (city: string) => void;
}

// Статусы, которые учитываются во временной шкале
const ACTIVE_STATUSES = ['Ожидает', 'Принял', 'В пути'];

// Хелпер для форматирования даты
const formatDateLabel = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
  
  const isTomorrow = date.getDate() === tomorrow.getDate() && 
                     date.getMonth() === tomorrow.getMonth() && 
                     date.getFullYear() === tomorrow.getFullYear();
  
  if (isToday) return 'Сегодня';
  if (isTomorrow) return 'Завтра';
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long',
    weekday: 'short'
  });
};

const TimeSlotsTableComponent = ({ orders, selectedDate, onDateChange, onCityClick }: TimeSlotsTableProps) => {
  const [activeCity, setActiveCity] = useState<string>('all');
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  const equipmentColors = isV2 ? EQUIPMENT_TYPE_COLORS_V2 : EQUIPMENT_TYPE_COLORS;

  // Хелпер для проверки совпадения даты
  // Сравниваем даты в локальном времени (orderDate конвертируется из UTC в локальное)
  const isSameDate = useCallback((orderDate: Date, targetDate: Date): boolean => {
    return orderDate.getDate() === targetDate.getDate() && 
           orderDate.getMonth() === targetDate.getMonth() && 
           orderDate.getFullYear() === targetDate.getFullYear();
  }, []);

  // Фильтруем заказы только с активными статусами
  const activeOrders = useMemo(() => {
    return orders.filter(order => ACTIVE_STATUSES.includes(order.statusOrder));
  }, [orders]);

  // Получаем уникальные города из заказов на выбранную дату
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting || !order.city) return;
      const orderTime = new Date(order.dateMeeting);
      
      if (isSameDate(orderTime, selectedDate)) {
        citySet.add(order.city);
      }
    });
    
    return Array.from(citySet).sort();
  }, [activeOrders, selectedDate, isSameDate]);

  // Подсчёт заказов на выбранную дату по городам
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting) return;
      const orderTime = new Date(order.dateMeeting);
      
      if (isSameDate(orderTime, selectedDate)) {
        counts.all = (counts.all || 0) + 1;
        if (order.city) {
          counts[order.city] = (counts[order.city] || 0) + 1;
        }
      }
    });
    
    return counts;
  }, [activeOrders, selectedDate, isSameDate]);

  // Обработчик клика на город
  const handleCityClick = useCallback((city: string) => {
    setActiveCity(city);
    if (onCityClick) {
      // Передаем пустую строку для "Все города" чтобы сбросить фильтр
      onCityClick(city === 'all' ? '' : city);
    }
  }, [onCityClick]);

  // Переключение даты
  const goToPrevDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  }, [selectedDate, onDateChange]);

  const goToNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  }, [selectedDate, onDateChange]);

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

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
      
      // Проверяем, что заявка на выбранную дату
      if (!isSameDate(orderTime, selectedDate)) return false;
      
      const orderHour = orderTime.getHours();
      const orderMinute = orderTime.getMinutes();
      return orderHour === hour && orderMinute === minute;
    }).length;
  }, [filteredOrders, selectedDate, isSameDate]);

  // Подсчёт итогов по типу техники
  const getEquipmentTotal = useCallback((typeEquipment: string) => {
    return filteredOrders.filter(order => {
      if (!order.dateMeeting || order.typeEquipment !== typeEquipment) return false;
      const orderTime = new Date(order.dateMeeting);
      
      return isSameDate(orderTime, selectedDate);
    }).length;
  }, [filteredOrders, selectedDate, isSameDate]);

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
                count > 0 ? colorClass : (isV2 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600')
              }`}>
                {count}
              </div>
            </div>
          );
        })}
        <div className={`text-lg font-bold ${colorClass} text-center border-l ${isV2 ? 'border-gray-200 dark:border-gray-600' : 'border-[#FFD700]/20'} pl-2`}>
          {total}
        </div>
      </div>
    );
  }, [getOrdersForTimeSlot, getEquipmentTotal, isV2]);

  // Проверка, является ли выбранная дата сегодняшней
  const isSelectedToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  return (
    <Card className={isV2 ? "bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad" : "bg-[#17212b] border-2 border-[#FFD700]/30"}>
      <CardHeader className="pb-2">
        {/* Навигация по датам */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevDay}
            className={isV2 
              ? "p-2 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600 transition-all"
              : "p-2 rounded-lg bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30 transition-all"
            }
            title="Предыдущий день"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={goToToday}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSelectedToday
                ? (isV2 ? 'bg-[#FEC004] text-gray-900' : 'bg-[#FFD700] text-[#02111B]')
                : (isV2 
                    ? 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
                    : 'bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30'
                  )
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDateLabel(selectedDate)}
          </button>
          
          <input
            type="date"
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month, day] = e.target.value.split('-').map(Number);
              const newDate = new Date(year, month - 1, day);
              if (!isNaN(newDate.getTime())) {
                onDateChange(newDate);
              }
            }}
            className={isV2 
              ? "px-2 py-1.5 rounded-lg text-sm bg-white dark:bg-[#252d3a] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus:outline-none dark:[color-scheme:dark]"
              : "px-2 py-1.5 rounded-lg text-sm bg-[#0f0f23] text-gray-300 border border-[#FFD700]/30 hover:border-[#FFD700]/50 focus:border-[#FFD700] focus:outline-none [color-scheme:dark]"
            }
          />
          
          <button
            onClick={goToNextDay}
            className={isV2 
              ? "p-2 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600 transition-all"
              : "p-2 rounded-lg bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30 transition-all"
            }
            title="Следующий день"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Табы городов */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => handleCityClick('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCity === 'all'
                ? (isV2 ? 'bg-[#FEC004] text-gray-900' : 'bg-[#FFD700] text-[#02111B]')
                : (isV2 
                    ? 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
                    : 'bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30'
                  )
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Все города
            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
              activeCity === 'all' 
                ? (isV2 ? 'bg-gray-900/10' : 'bg-[#02111B]/20')
                : (isV2 ? 'bg-[#FEC004]/20 text-[#FEC004]' : 'bg-[#FFD700]/20 text-[#FFD700]')
            }`}>
              {cityCounts.all || 0}
            </span>
          </button>
          
          {cities.map(city => (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCity === city
                  ? (isV2 ? 'bg-[#FEC004] text-gray-900' : 'bg-[#FFD700] text-[#02111B]')
                  : (isV2 
                      ? 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
                      : 'bg-[#0f0f23] text-gray-300 hover:bg-[#FFD700]/20 hover:text-[#FFD700] border border-[#FFD700]/30'
                    )
              }`}
            >
              {city}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeCity === city 
                  ? (isV2 ? 'bg-gray-900/10' : 'bg-[#02111B]/20')
                  : (isV2 ? 'bg-[#FEC004]/20 text-[#FEC004]' : 'bg-[#FFD700]/20 text-[#FFD700]')
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
              <div className={`text-sm font-medium ${isV2 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300'} text-center`}>Тип</div>
              {TIME_SLOTS.map(({ timeString }) => (
                <div key={timeString} className={`text-sm font-medium ${isV2 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300'} text-center`}>
                  {timeString}
                </div>
              ))}
              <div className={`text-sm font-medium ${isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-[#FFD700]'} text-center border-l ${isV2 ? 'border-gray-200 dark:border-gray-600' : 'border-[#FFD700]/20'} pl-2`}>
                Итого
              </div>
            </div>
            
            {/* Equipment type rows */}
            {renderTimeSlotRow('КП', 'КП', equipmentColors['КП'])}
            {renderTimeSlotRow('БТ', 'БТ', equipmentColors['БТ'])}
            {renderTimeSlotRow('МНЧ', 'МНЧ', equipmentColors['МНЧ'])}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

TimeSlotsTableComponent.displayName = 'TimeSlotsTable';

export const TimeSlotsTable = React.memo(TimeSlotsTableComponent);
