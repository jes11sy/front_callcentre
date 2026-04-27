import api from '@/lib/api';

export type SiteOrdersQueryParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

export const siteOrdersService = {
  async getSiteOrders(params: SiteOrdersQueryParams) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const response = await api.get(`/site-orders?${query.toString()}`);
    return response.data;
  },

  async updateStatus(id: number, status: string, callbackAt?: string) {
    const response = await api.patch(`/site-orders/${id}/status`, { status, callbackAt });
    return response.data;
  },

  async updateOperatorComment(id: number, commentOperator: string) {
    const response = await api.patch(`/site-orders/${id}`, { commentOperator });
    return response.data;
  },
};

