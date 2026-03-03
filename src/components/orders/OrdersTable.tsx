'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus } from 'lucide-react';
import { Order, OrdersResponse } from '@/types/orders';
import { STATUS_COLORS, STATUS_COLORS_V2, PAGE_SIZES } from '@/constants/orders';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import React, { useCallback, ReactNode } from 'react';
import { useDesignStore } from '@/store/designStore';

interface OrdersTableProps {
  ordersData: OrdersResponse | undefined;
  isLoading: boolean;
  search: string;
  limit: number;
  onViewOrder: (order: Order) => void;
  onCreateOrder: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  filtersComponent?: ReactNode;
}

const OrdersTableComponent = ({
  ordersData,
  isLoading,
  search,
  limit,
  onViewOrder,
  onCreateOrder,
  onPageChange,
  onLimitChange,
  filtersComponent
}: OrdersTableProps) => {
  const { theme } = useDesignStore();
  
  // Мемоизированная функция форматирования даты (используется в цикле)
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad">
        <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
          {/* Мобильный вид */}
          <div className="flex flex-col gap-2 sm:hidden mb-4">
            {filtersComponent}
            <Button 
              onClick={onCreateOrder}
              className="w-full bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Новый
            </Button>
          </div>
          {/* Десктопный вид */}
          <div className="hidden sm:flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className="shrink-0 bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать заказ
            </Button>
          </div>
          <LoadingState 
            message="Загрузка заказов..." 
            size="lg"
            className="py-12"
          />
        </CardContent>
      </Card>
    );
  }

  if (ordersData?.orders?.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad">
        <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
          {/* Мобильный вид */}
          <div className="flex flex-col gap-2 sm:hidden mb-4">
            {filtersComponent}
            <Button 
              onClick={onCreateOrder}
              className="w-full bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Новый
            </Button>
          </div>
          {/* Десктопный вид */}
          <div className="hidden sm:flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className="shrink-0 bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать заказ
            </Button>
          </div>
          <EmptyState
            title="Заказы не найдены"
            description="Попробуйте изменить параметры фильтрации"
          />
        </CardContent>
      </Card>
    );
  }

  const statusColors = STATUS_COLORS_V2;

  return (
    <Card className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad">
      <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
        {/* Мобильный вид: кнопки в колонку на всю ширину */}
        <div className="flex flex-col gap-2 sm:hidden mb-4">
          {filtersComponent}
          <Button 
            onClick={onCreateOrder}
            className="w-full bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Новый
          </Button>
        </div>
        
        {/* Десктопный вид: кнопки в строку */}
        <div className="hidden sm:flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            {filtersComponent}
          </div>
          <Button 
            onClick={onCreateOrder}
            className="shrink-0 bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать заказ
          </Button>
        </div>
        {ordersData?.orders && ordersData.orders.length > 0 ? (
          <>
            <div className="overflow-x-auto w-full -mx-2 sm:mx-0 px-2 sm:px-0">
              <Table className="w-full min-w-[900px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a]">
                    <TableHead className="w-14 sm:w-16 text-xs sm:text-sm text-gray-600 dark:text-gray-400">ID</TableHead>
                    <TableHead className="w-14 sm:w-20 text-xs sm:text-sm text-gray-600 dark:text-gray-400">РК</TableHead>
                    <TableHead className="w-20 sm:w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Город</TableHead>
                    <TableHead className="w-28 sm:w-36 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Источник</TableHead>
                    <TableHead className="w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Телефон</TableHead>
                    <TableHead className="w-20 sm:w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Тип</TableHead>
                    <TableHead className="w-28 sm:w-32 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Клиент</TableHead>
                    <TableHead className="w-32 sm:w-40 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Адрес</TableHead>
                    <TableHead className="w-24 sm:w-28 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Дата</TableHead>
                    <TableHead className="w-20 sm:w-28 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Техника</TableHead>
                    <TableHead className="w-20 sm:w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Статус</TableHead>
                    <TableHead className="w-20 sm:w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Мастер</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.orders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className="min-w-[900px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a] cursor-pointer transition-colors"
                      onClick={() => onViewOrder(order)}
                    >
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{order.rk?.name || '—'}</TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{order.city?.name || '—'}</TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-28 sm:max-w-36 truncate text-xs sm:text-sm text-gray-700 dark:text-gray-300" title={[order.cityName ?? order.city?.name, order.rkName ?? order.rk?.name, order.source].filter(Boolean).join(' • ') || '—'}>
                          {(() => {
                            const parts = [order.cityName ?? order.city?.name, order.rkName ?? order.rk?.name, order.source].filter(Boolean);
                            return parts.length > 0 ? parts.join(' • ') : <span className="text-gray-400">—</span>;
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-20 sm:max-w-24 truncate text-xs sm:text-sm text-gray-700 dark:text-gray-300" title={order.phone}>
                          {order.phone || <span className="text-gray-400">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                          {order.typeOrder || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-24 sm:max-w-32 truncate text-xs sm:text-sm text-gray-700 dark:text-gray-300" title={order.clientName}>
                          {order.clientName}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-28 sm:max-w-40 truncate text-xs sm:text-sm text-gray-700 dark:text-gray-300" title={order.address}>
                          {order.address}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="text-xs sm:text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {formatDate(order.dateMeeting)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-20 sm:max-w-28 truncate" title={order.equipmentType?.name || '—'}>
                          <Badge variant="outline" className="text-[10px] sm:text-xs border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/10">
                            {order.equipmentType?.name || '—'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <Badge 
                          className={`text-[10px] sm:text-xs whitespace-nowrap ${statusColors[order.status?.name as keyof typeof statusColors] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}
                        >
                          {order.status?.name || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-20 sm:max-w-24 truncate text-xs sm:text-sm text-gray-700 dark:text-gray-300" title={order.master?.name || 'Не назначен'}>
                          {order.master?.name || <span className="text-gray-400">—</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Пагинация */}
            {ordersData.pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label htmlFor="page-size" className="text-xs sm:text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                      <span className="hidden sm:inline">На странице:</span>
                      <span className="sm:hidden">Показать:</span>
                    </Label>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        onLimitChange(parseInt(value));
                        onPageChange(1);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 [&_svg]:text-gray-500 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#1e2530] border-gray-200 dark:border-gray-600">
                        {PAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {ordersData.pagination.totalPages > 1 && (
                  <OptimizedPagination
                    currentPage={ordersData.pagination.page}
                    totalPages={ordersData.pagination.totalPages}
                    onPageChange={onPageChange}
                    showFirstLast={false}
                    showPrevNext={true}
                    maxVisiblePages={3}
                    disabled={isLoading}
                    variant="v2"
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Нет данных для отображения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

OrdersTableComponent.displayName = 'OrdersTable';

export const OrdersTable = React.memo(OrdersTableComponent);
