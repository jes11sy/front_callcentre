'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus } from 'lucide-react';
import { Order, OrdersResponse } from '@/types/orders';
import { STATUS_COLORS, PAGE_SIZES } from '@/constants/orders';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error-boundary';
import { OptimizedPagination } from '@/components/ui/optimized-pagination';
import React, { useCallback, ReactNode } from 'react';

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
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="px-2 py-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"
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
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="px-2 py-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать заказ
            </Button>
          </div>
          <EmptyState
            title={search ? 'Заказы не найдены' : 'Нет заказов'}
            description={search ? 'Попробуйте изменить параметры поиска' : 'Создайте свой первый заказ'}
            icon={<ShoppingCart className="h-12 w-12 text-gray-300" />}
            action={!search ? (
              <Button 
                onClick={onCreateOrder}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Создать первый заказ
              </Button>
            ) : undefined}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
      <CardContent className="px-2 py-2">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {filtersComponent}
          </div>
          <Button 
            onClick={onCreateOrder}
            className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать заказ
          </Button>
        </div>
        {ordersData?.orders && ordersData.orders.length > 0 ? (
          <>
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-[#FFD700]/30 hover:bg-[#FFD700]/5">
                    <TableHead className="w-16 text-gray-300">ID</TableHead>
                    <TableHead className="w-20 text-gray-300">РК</TableHead>
                    <TableHead className="w-24 text-gray-300">Город</TableHead>
                    <TableHead className="w-28 text-gray-300">Источник</TableHead>
                    <TableHead className="w-24 text-gray-300">Телефон</TableHead>
                    <TableHead className="w-24 text-gray-300">Тип заявки</TableHead>
                    <TableHead className="w-32 text-gray-300">Клиент</TableHead>
                    <TableHead className="w-40 text-gray-300">Адрес</TableHead>
                    <TableHead className="w-28 text-gray-300">Дата встречи</TableHead>
                    <TableHead className="w-28 text-gray-300">Тип техники</TableHead>
                    <TableHead className="w-40 text-gray-300">Проблема</TableHead>
                    <TableHead className="w-24 text-gray-300">Статус</TableHead>
                    <TableHead className="w-24 text-gray-300">Мастер</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.orders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className="border-b border-gray-700 hover:bg-[#FFD700]/10 cursor-pointer transition-colors"
                      onClick={() => onViewOrder(order)}
                    >
                      <TableCell className="font-medium text-white">{order.id}</TableCell>
                      <TableCell className="text-gray-300">{order.rk}</TableCell>
                      <TableCell className="text-gray-300">{order.city}</TableCell>
                      <TableCell>
                        <div className="max-w-28 truncate text-gray-300" title={order.avitoName || 'Не указан'}>
                          {order.avitoName || <span className="text-gray-500">Не указан</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-24 truncate text-gray-300" title={order.phone}>
                          {order.phone || <span className="text-gray-500">Не указан</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap border-[#FFD700]/30 text-[#FFD700]">
                          {order.typeOrder || 'Не указан'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate text-gray-300" title={order.clientName}>
                          {order.clientName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-40 truncate text-gray-300" title={order.address}>
                          {order.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm whitespace-nowrap text-gray-300">
                          {formatDate(order.dateMeeting)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-28 truncate" title={order.typeEquipment}>
                          <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">
                            {order.typeEquipment}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-40 truncate text-gray-300" title={order.problem}>
                          {order.problem}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-xs whitespace-nowrap ${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                        >
                          {order.statusOrder}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-24 truncate text-gray-300" title={order.master?.name || 'Не назначен'}>
                          {order.master?.name || <span className="text-gray-500">Не назначен</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Пагинация */}
            {ordersData.pagination && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Показано {((ordersData.pagination.page - 1) * ordersData.pagination.limit) + 1} - {Math.min(ordersData.pagination.page * ordersData.pagination.limit, ordersData.pagination.total)} из {ordersData.pagination.total} заказов
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="page-size" className="text-sm text-gray-400">
                      На странице:
                    </Label>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        onLimitChange(parseInt(value));
                        onPageChange(1);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
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
                    showFirstLast={true}
                    showPrevNext={true}
                    maxVisiblePages={5}
                    disabled={isLoading}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">Нет данных для отображения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

OrdersTableComponent.displayName = 'OrdersTable';

export const OrdersTable = React.memo(OrdersTableComponent);
