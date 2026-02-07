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
  const { version } = useDesignStore();
  const isV2 = version === 'v2';
  
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
      <Card className={isV2 ? "bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad" : "bg-[#17212b] border-2 border-[#FFD700]/30"}>
        <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex-1 w-full sm:w-auto">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className={`w-full sm:w-auto ${isV2 ? "bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00] shrink-0" : "bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать заказ</span>
              <span className="sm:hidden">Новый</span>
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
      <Card className={isV2 ? "bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad" : "bg-[#17212b] border-2 border-[#FFD700]/30"}>
        <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex-1 w-full sm:w-auto">
              {filtersComponent}
            </div>
            <Button 
              onClick={onCreateOrder}
              className={`w-full sm:w-auto ${isV2 ? "bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00] shrink-0" : "bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать заказ</span>
              <span className="sm:hidden">Новый</span>
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

  const statusColors = isV2 ? STATUS_COLORS_V2 : STATUS_COLORS;

  return (
    <Card className={isV2 ? "bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad" : "bg-[#17212b] border-2 border-[#FFD700]/30"}>
      <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex-1 w-full sm:w-auto">
            {filtersComponent}
          </div>
          <Button 
            onClick={onCreateOrder}
            className={`w-full sm:w-auto ${isV2 ? "bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00] shrink-0" : "bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90 shrink-0"}`}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Создать заказ</span>
            <span className="sm:hidden">Новый</span>
          </Button>
        </div>
        {ordersData?.orders && ordersData.orders.length > 0 ? (
          <>
            <div className="overflow-x-auto w-full -mx-2 sm:mx-0 px-2 sm:px-0">
              <Table className="w-full min-w-[900px]">
                <TableHeader>
                  <TableRow className={isV2 ? "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a]" : "border-b border-[#FFD700]/30 hover:bg-[#FFD700]/5"}>
                    <TableHead className={`w-14 sm:w-16 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>ID</TableHead>
                    <TableHead className={`w-14 sm:w-20 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>РК</TableHead>
                    <TableHead className={`w-20 sm:w-24 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Город</TableHead>
                    <TableHead className={`w-24 sm:w-28 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Источник</TableHead>
                    <TableHead className={`w-24 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Телефон</TableHead>
                    <TableHead className={`w-20 sm:w-24 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Тип</TableHead>
                    <TableHead className={`w-28 sm:w-32 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Клиент</TableHead>
                    <TableHead className={`w-32 sm:w-40 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Адрес</TableHead>
                    <TableHead className={`w-24 sm:w-28 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Дата</TableHead>
                    <TableHead className={`w-20 sm:w-28 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Техника</TableHead>
                    <TableHead className={`w-32 sm:w-40 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Проблема</TableHead>
                    <TableHead className={`w-20 sm:w-24 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Статус</TableHead>
                    <TableHead className={`w-20 sm:w-24 text-xs sm:text-sm ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-300"}`}>Мастер</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.orders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className={`min-w-[900px] ${isV2 
                        ? "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a] cursor-pointer transition-colors"
                        : "border-b border-gray-700 hover:bg-[#FFD700]/10 cursor-pointer transition-colors"
                      }`}
                      onClick={() => onViewOrder(order)}
                    >
                      <TableCell className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${isV2 ? "font-medium text-gray-900 dark:text-gray-100" : "font-medium text-white"}`}>{order.id}</TableCell>
                      <TableCell className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`}>{order.rk}</TableCell>
                      <TableCell className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`}>{order.city}</TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-20 sm:max-w-28 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.avitoName || 'Не указан'}>
                          {order.avitoName || <span className={isV2 ? "text-gray-400" : "text-gray-500"}>—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-20 sm:max-w-24 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.phone}>
                          {order.phone || <span className={isV2 ? "text-gray-400" : "text-gray-500"}>—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <Badge variant="outline" className={`text-[10px] sm:text-xs whitespace-nowrap ${isV2 
                          ? "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                          : "border-[#FFD700]/30 text-[#FFD700]"
                        }`}>
                          {order.typeOrder || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-24 sm:max-w-32 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.clientName}>
                          {order.clientName}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-28 sm:max-w-40 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.address}>
                          {order.address}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`text-xs sm:text-sm whitespace-nowrap ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`}>
                          {formatDate(order.dateMeeting)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="max-w-20 sm:max-w-28 truncate" title={order.typeEquipment}>
                          <Badge variant="outline" className={`text-[10px] sm:text-xs ${isV2 
                            ? "border-[#FEC004]/30 text-[#FEC004] bg-[#FEC004]/10"
                            : "border-[#FFD700]/30 text-[#FFD700]"
                          }`}>
                            {order.typeEquipment}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-28 sm:max-w-40 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.problem}>
                          {order.problem}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <Badge 
                          className={`text-[10px] sm:text-xs whitespace-nowrap ${statusColors[order.statusOrder as keyof typeof statusColors] || (isV2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600' : 'bg-gray-500/20 text-gray-400 border-gray-500/30')}`}
                        >
                          {order.statusOrder}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className={`max-w-20 sm:max-w-24 truncate text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : "text-gray-300"}`} title={order.master?.name || 'Не назначен'}>
                          {order.master?.name || <span className={isV2 ? "text-gray-400" : "text-gray-500"}>—</span>}
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
                  {!isV2 && (
                    <div className="hidden sm:block text-sm text-gray-400">
                      Показано {((ordersData.pagination.page - 1) * ordersData.pagination.limit) + 1} - {Math.min(ordersData.pagination.page * ordersData.pagination.limit, ordersData.pagination.total)} из {ordersData.pagination.total}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label htmlFor="page-size" className={`text-xs sm:text-sm whitespace-nowrap ${isV2 ? "text-gray-600 dark:text-gray-400" : "text-gray-400"}`}>
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
                      <SelectTrigger className={`w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 [&_svg]:text-gray-500 focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isV2 ? "bg-white dark:bg-[#1e2530] border-gray-200 dark:border-gray-600" : ""}>
                        {PAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value} className={`text-xs sm:text-sm ${isV2 ? "text-gray-700 dark:text-gray-300" : ""}`}>
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
                    variant={isV2 ? 'v2' : 'v1'}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className={`h-12 w-12 mx-auto mb-4 ${isV2 ? "text-gray-400" : "text-gray-300"}`} />
            <p className={isV2 ? "text-gray-500 dark:text-gray-400" : "text-gray-600"}>Нет данных для отображения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

OrdersTableComponent.displayName = 'OrdersTable';

export const OrdersTable = React.memo(OrdersTableComponent);
