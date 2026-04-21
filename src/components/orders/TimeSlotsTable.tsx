'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Order } from '@/types/orders';
import { TIME_SLOTS } from '@/constants/orders';
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
  const isDark = theme === 'dark';
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
    return orders.filter(order => ACTIVE_STATUSES.includes(order.status?.name || ''));
  }, [orders]);

  // Получаем уникальные города (name + id) из заказов на выбранную дату
  const cities = useMemo(() => {
    const cityMap = new Map<string, number>(); // name → id
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting || !order.city?.name || !order.city?.id) return;
      const orderTime = new Date(order.dateMeeting);
      
      if (isSameDate(orderTime, selectedDate)) {
        cityMap.set(order.city.name, order.city.id);
      }
    });
    
    return Array.from(cityMap.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'ru'))
      .map(([name, id]) => ({ name, id }));
  }, [activeOrders, selectedDate, isSameDate]);

  // Подсчёт заказов на выбранную дату по городам (ключ — city.name)
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    
    activeOrders.forEach(order => {
      if (!order.dateMeeting) return;
      const orderTime = new Date(order.dateMeeting);
      
      if (isSameDate(orderTime, selectedDate)) {
        counts.all = (counts.all || 0) + 1;
        const cityName = order.city?.name;
        if (cityName) {
          counts[cityName] = (counts[cityName] || 0) + 1;
        }
      }
    });
    
    return counts;
  }, [activeOrders, selectedDate, isSameDate]);

  // Маппинг city.name → city.id для передачи ID во внешний onCityClick
  const cityNameToId = useMemo(() => {
    return Object.fromEntries(cities.map(c => [c.name, c.id]));
  }, [cities]);

  // Обработчик клика на город — внутри храним name, наружу отдаём cityId
  const handleCityClick = useCallback((cityName: string) => {
    setActiveCity(cityName);
    if (onCityClick) {
      if (cityName === 'all') {
        onCityClick('');
      } else {
        const cityId = cityNameToId[cityName];
        onCityClick(cityId ? String(cityId) : '');
      }
    }
  }, [onCityClick, cityNameToId]);

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
    return activeOrders.filter(order => order.city?.name === activeCity);
  }, [activeOrders, activeCity]);

  // Мемоизированная функция для подсчета заказов в временном слоте
  const getOrdersForTimeSlot = useCallback((hour: number, minute: number, equipmentTypeName: string) => {
    return filteredOrders.filter(order => {
      if (!order.dateMeeting || order.equipmentType?.name !== equipmentTypeName) return false;
      const orderTime = new Date(order.dateMeeting);
      
      if (!isSameDate(orderTime, selectedDate)) return false;
      
      const orderHour = orderTime.getHours();
      const orderMinute = orderTime.getMinutes();
      return orderHour === hour && orderMinute === minute;
    }).length;
  }, [filteredOrders, selectedDate, isSameDate]);

  // Подсчёт итогов по типу техники
  const getEquipmentTotal = useCallback((equipmentTypeName: string) => {
    return filteredOrders.filter(order => {
      if (!order.dateMeeting || order.equipmentType?.name !== equipmentTypeName) return false;
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
              className={`text-center ${isCurrentSlot ? (isDark ? 'bg-white/10 rounded' : 'bg-[#FEC004]/15 rounded') : ''}`}
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
    <Card className={`rounded-[20px] border font-myriad ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`}>
      <CardHeader className="pb-2 px-3 sm:px-6">
        {/* Мобильный вид: одна строка */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          {/* Левая часть: навигация по датам */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevDay}
              className={`p-1.5 rounded-lg border ${isDark ? 'bg-white/[0.04] border-white/15 text-white active:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 active:bg-black/5'}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToToday}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelectedToday
                  ? (isDark ? 'bg-white text-[#111113]' : 'bg-[#FEC004] text-[#111113]')
                  : (isDark ? 'bg-white/[0.04] border border-white/15 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600')
              }`}
            >
              {formatDateLabel(selectedDate, true)}
            </button>
            
            <button
              onClick={goToNextDay}
              className={`p-1.5 rounded-lg border ${isDark ? 'bg-white/[0.04] border-white/15 text-white active:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 active:bg-black/5'}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          {/* Правая часть: dropdown городов */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${isDark ? 'bg-white/[0.04] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              <span className="max-w-[80px] truncate">{activeCityLabel}</span>
              <span className={`px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-white/10 text-white' : 'bg-[#FEC004]/15 text-[#b58500]'}`}>
                {cityCounts[activeCity] || cityCounts.all || 0}
              </span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isCityDropdownOpen && (
              <div className={`absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg shadow-lg border ${isDark ? 'bg-[#1e1e20] border-white/10' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => {
                    handleCityClick('all');
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
                    activeCity === 'all'
                      ? (isDark ? 'bg-white/10 text-white' : 'bg-[#FEC004]/15 text-[#b58500]')
                      : (isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50')
                  }`}
                >
                  <span>Все города</span>
                  <span className={`px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-white/10' : 'bg-[#FEC004]/15'}`}>{cityCounts.all || 0}</span>
                </button>
                {cities.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleCityClick(c.name);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
<<<<<<< Updated upstream
                      activeCity === c.name
                        ? 'bg-[#FEC004]/20 text-[#FEC004]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2530]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="px-1 py-0.5 rounded text-[10px] bg-[#FEC004]/20">{cityCounts[c.name] || 0}</span>
=======
                      activeCity === city
                        ? (isDark ? 'bg-white/10 text-white' : 'bg-[#FEC004]/15 text-[#b58500]')
                        : (isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50')
                    }`}
                  >
                    <span>{city}</span>
                    <span className={`px-1 py-0.5 rounded text-[10px] ${isDark ? 'bg-white/10' : 'bg-[#FEC004]/15'}`}>{cityCounts[city] || 0}</span>
>>>>>>> Stashed changes
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
              className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-white/[0.04] border-white/15 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-black/5'}`}
              title="Предыдущий день"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToToday}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSelectedToday
                  ? (isDark ? 'bg-white text-[#111113]' : 'bg-[#FEC004] text-[#111113]')
                  : (isDark ? 'bg-white/[0.04] border border-white/15 text-white hover:bg-white/10' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-black/5')
              }`}
            >
              {formatDateLabel(selectedDate)}
            </button>
            
            <button
              onClick={goToNextDay}
              className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-white/[0.04] border-white/15 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-black/5'}`}
              title="Следующий день"
            >
              <ChevronRight className="h-4 w-4" />
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
              className={`px-2 py-1.5 rounded-lg text-sm border outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 dark:[color-scheme:dark] ${isDark ? 'bg-white/[0.04] border-white/15 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            />
          </div>
          
          {/* Табы городов */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => handleCityClick('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCity === 'all'
                  ? (isDark ? 'bg-white text-[#111113]' : 'bg-[#FEC004] text-[#111113]')
                  : (isDark ? 'bg-white/[0.04] border border-white/15 text-white hover:bg-white/10' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-black/5')
              }`}
            >
              Все города
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                activeCity === 'all' 
                  ? 'bg-gray-900/10'
                  : (isDark ? 'bg-white/10 text-white' : 'bg-[#FEC004]/15 text-[#b58500]')
              }`}>
                {cityCounts.all || 0}
              </span>
            </button>
            
            {cities.map(c => (
              <button
                key={c.id}
                onClick={() => handleCityClick(c.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
<<<<<<< Updated upstream
                  activeCity === c.name
                    ? 'bg-[#FEC004] text-gray-900'
                    : 'bg-gray-50 dark:bg-[#252d3a] text-gray-600 dark:text-gray-300 hover:bg-[#FEC004]/10 hover:text-[#FEC004] border border-gray-200 dark:border-gray-600'
=======
                  activeCity === city
                    ? (isDark ? 'bg-white text-[#111113]' : 'bg-[#FEC004] text-[#111113]')
                    : (isDark ? 'bg-white/[0.04] border border-white/15 text-white hover:bg-white/10' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-black/5')
>>>>>>> Stashed changes
                }`}
              >
                {c.name}
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  activeCity === c.name 
                    ? 'bg-gray-900/10'
                    : (isDark ? 'bg-white/10 text-white' : 'bg-[#FEC004]/15 text-[#b58500]')
                }`}>
                  {cityCounts[c.name] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div 
          ref={scrollContainerRef}
          className={`overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-thin ${isDark ? 'orders-dark-scroll' : ''}`}
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
                        ? (isDark ? 'text-white bg-white/10 rounded px-1' : 'text-[#b58500] bg-[#FEC004]/15 rounded px-1')
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
