'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Order } from '@/types/orders';
import { TIME_SLOTS, EQUIPMENT_TYPE_COLORS } from '@/constants/orders';
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
const formatDateLabel = (date: Date, short = false): string => {
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
  
  if (short) {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short'
    });
  }
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long',
    weekday: 'short'
  });
};

// Получить индекс текущего временного слота
const getCurrentTimeSlotIndex = (): number => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // TIME_SLOTS начинается с 10:00, шаг 30 минут
  // Индекс = (час - 10) * 2 + (минуты >= 30 ? 1 : 0)
  if (currentHour < 10) return 0;
  if (currentHour > 22 || (currentHour === 22 && currentMinute > 0)) return TIME_SLOTS.length - 1;
  
  return (currentHour - 10) * 2 + (currentMinute >= 30 ? 1 : 0);
};

const TimeSlotsTableComponent = ({ orders, selectedDate, onDateChange, onCityClick }: TimeSlotsTableProps) => {
  const [activeCity, setActiveCity] = useState<string>('all');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useDesignStore();
  const equipmentColors = EQUIPMENT_TYPE_COLORS_V2;
  
  // Текущий временной слот для выделения
  const currentTimeSlotIndex = useMemo(() => getCurrentTimeSlotIndex(), []);
  
  // Проверка, является ли выбранная дата сегодняшней
  const isSelectedToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);
  
  // Автоскролл к текущему времени при загрузке (только для сегодня)
  useEffect(() => {
    if (isSelectedToday && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Ширина одной колонки примерно 40-50px, первая колонка - тип техники
      const columnWidth = 48;
      const scrollPosition = (currentTimeSlotIndex + 1) * columnWidth - container.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  }, [isSelectedToday, currentTimeSlotIndex]);
  
  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="grid gap-1 sm:gap-2 min-w-max grid-time-slots-with-total">
        <div className={`text-xs sm:text-sm font-medium ${colorClass} text-center`}>{label}</div>
        {TIME_SLOTS.map(({ hour, minute, index: _index }) => {
          const count = getOrdersForTimeSlot(hour, minute, typeEquipment);
          const isCurrentSlot = isSelectedToday && _index === currentTimeSlotIndex;
          
          return (
            <div 
              key={`${typeEquipment}-${_index}`} 
              className={`text-center ${isCurrentSlot ? 'bg-[#FEC004]/20 rounded' : ''}`}
            >
              <div className={`text-sm sm:text-lg font-bold ${
                count > 0 ? colorClass : 'text-gray-400 dark:text-gray-500'
              }`}>
                {count}
              </div>
            </div>
          );
        })}
        <div className={`text-sm sm:text-lg font-bold ${colorClass} text-center border-l border-gray-200 dark:border-gray-600 pl-1 sm:pl-2`}>
          {total}
        </div>
      </div>
    );
  }, [getOrdersForTimeSlot, getEquipmentTotal, isSelectedToday, currentTimeSlotIndex]);

  // Название активного города для отображения
  const activeCityLabel = activeCity === 'all' 
    ? 'Все города' 
    : activeCity;

  return (
    <Card className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad">
      <CardHeader className="pb-2 px-3 sm:px-6">
        {/* Мобильный вид: одна строка */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          {/* Левая часть: навигация по датам */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevDay}
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 active:bg-[#FEC004]/20 border border-gray-200 dark:border-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToToday}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelectedToday
                  ? 'bg-[#FEC004] text-gray-900'
                  : 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {formatDateLabel(selectedDate, true)}
            </button>
            
            <button
              onClick={goToNextDay}
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 active:bg-[#FEC004]/20 border border-gray-200 dark:border-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Правая часть: dropdown городов */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            >
              <span className="max-w-[80px] truncate">{activeCityLabel}</span>
              <span className="px-1 py-0.5 rounded text-[10px] bg-[#FEC004]/20 text-[#FEC004]">
                {cityCounts[activeCity] || cityCounts.all || 0}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isCityDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg shadow-lg border bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    handleCityClick('all');
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
                    activeCity === 'all'
                      ? 'bg-[#FEC004]/20 text-[#FEC004]'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2530]'
                  }`}
                >
                  <span>Все города</span>
                  <span className="px-1 py-0.5 rounded text-[10px] bg-[#FEC004]/20">{cityCounts.all || 0}</span>
                </button>
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      handleCityClick(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
                      activeCity === city
                        ? 'bg-[#FEC004]/20 text-[#FEC004]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2530]'
                    }`}
                  >
                    <span>{city}</span>
                    <span className="px-1 py-0.5 rounded text-[10px] bg-[#FEC004]/20">{cityCounts[city] || 0}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Десктопный вид: оригинальная разметка */}
        <div className="hidden sm:block">
          {/* Навигация по датам */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goToPrevDay}
              className="p-2 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600 transition-all"
              title="Предыдущий день"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToToday}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSelectedToday
                  ? 'bg-[#FEC004] text-gray-900'
                  : 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
              }`}
            >
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
              className="px-2 py-1.5 rounded-lg text-sm bg-white dark:bg-[#252d3a] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-[#FEC004]/50 focus:border-[#FEC004] focus:outline-none dark:[color-scheme:dark]"
            />
            
            <button
              onClick={goToNextDay}
              className="p-2 rounded-lg bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600 transition-all"
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
                  ? 'bg-[#FEC004] text-gray-900'
                  : 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
              }`}
            >
              Все города
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeCity === 'all' 
                  ? 'bg-gray-900/10'
                  : 'bg-[#FEC004]/20 text-[#FEC004]'
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
                    ? 'bg-[#FEC004] text-gray-900'
                    : 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
                }`}
              >
                {city}
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  activeCity === city 
                    ? 'bg-gray-900/10'
                    : 'bg-[#FEC004]/20 text-[#FEC004]'
                }`}>
                  {cityCounts[city] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-thin"
        >
          <div className="space-y-2 sm:space-y-4 min-w-[600px]">
            {/* Header with time slots */}
            <div className="grid gap-1 sm:gap-2 min-w-max grid-time-slots-with-total">
              <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 text-center">Тип</div>
              {TIME_SLOTS.map(({ timeString, index: slotIndex }) => {
                const isCurrentSlot = isSelectedToday && slotIndex === currentTimeSlotIndex;
                return (
                  <div 
                    key={timeString} 
                    className={`text-xs sm:text-sm font-medium text-center ${
                      isCurrentSlot 
                        ? 'text-[#FEC004] bg-[#FEC004]/20 rounded px-1'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {timeString}
                  </div>
                );
              })}
              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center border-l border-gray-200 dark:border-gray-600 pl-1 sm:pl-2">
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
