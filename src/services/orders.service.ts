import api from '@/lib/api';
import { extractApiMessage, unwrapApiData } from '@/lib/http/unwrap';
import type { Order, OrdersResponse } from '@/types/orders';

export type OrdersListFilters = {
  search?: string;
  searchId?: string;
  searchPhone?: string;
  searchAddress?: string;
  status?: string;
  cityId?: string;
  master?: string;
  closingDate?: string;
};

export type OrdersListParams = OrdersListFilters & {
  page: number;
  limit: number;
};

const ORDER_UPDATE_ALLOWED_FIELDS: string[] = [
  'rkId',
  'cityId',
  'phone',
  'typeOrder',
  'clientName',
  'address',
  'dateMeeting',
  'equipmentTypeId',
  'callId',
  'operatorId',
  'statusId',
  'masterId',
  'result',
  'expenditure',
  'clean',
  'masterChange',
  'prepayment',
  'bsoDoc',
  'expenditureDoc',
  'closingAt',
  'comment',
];

export function buildOrdersParams(params: OrdersListParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) searchParams.append('search', params.search);
  if (params.searchId) searchParams.append('searchId', params.searchId);
  if (params.searchPhone) searchParams.append('searchPhone', params.searchPhone);
  if (params.searchAddress) searchParams.append('searchAddress', params.searchAddress);
  if (params.status && params.status !== 'all') searchParams.append('status', params.status);
  if (params.cityId) searchParams.append('cityId', params.cityId);
  if (params.master) searchParams.append('master', params.master);
  if (params.closingDate) searchParams.append('closingDate', params.closingDate);

  return searchParams;
}

export function buildTimelineParams(dateFrom: string): URLSearchParams {
  return new URLSearchParams({
    page: '1',
    limit: '300',
    dateType: 'meeting',
    dateFrom,
    dateTo: dateFrom,
  });
}

export function filterOrderUpdatePayload(orderData: Partial<Order>): Record<string, unknown> {
  const filteredData: Record<string, unknown> = {};
  const orderDataRecord = orderData as Record<string, unknown>;

  for (const key of ORDER_UPDATE_ALLOWED_FIELDS) {
    if (key in orderDataRecord) {
      filteredData[key] = orderDataRecord[key];
    }
  }

  return filteredData;
}

async function getOrdersByParams(params: URLSearchParams): Promise<OrdersResponse> {
  const response = await api.get(`/orders?${params}`, {
    timeout: 6000,
    __retryConfig: {
      maxRetries: 0,
      retryDelay: 0,
      backoff: false,
      retryOnStatus: [],
    },
  } as never);

  return unwrapApiData<OrdersResponse>(response.data);
}

export const ordersService = {
  getOrders: getOrdersByParams,

  getTimelineOrders(params: URLSearchParams) {
    return getOrdersByParams(params);
  },

  async getOrderById(orderId: number): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return unwrapApiData<Order>(response.data);
  },

  async updateOrderStatus(id: number, status: string) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return {
      payload: response.data,
      message: extractApiMessage(response.data),
    };
  },

  async updateOrder(id: number, orderData: Partial<Order>) {
    const filteredData = filterOrderUpdatePayload(orderData);
    const response = await api.put(`/orders/${id}`, filteredData);

    return {
      payload: response.data,
      message: extractApiMessage(response.data),
    };
  },
};

