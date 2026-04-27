import api from '@/lib/api';

export type AppealsQueryParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

export const appealsService = {
  async getAppeals(params: AppealsQueryParams) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });

    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const response = await api.get(`/appeals?${query.toString()}`);
    return response.data;
  },

  async getAppealsStats() {
    const response = await api.get('/appeals/stats');
    return response.data;
  },

  async updateAppealStatus(id: number, status: string) {
    const response = await api.patch(`/appeals/${id}`, { status });
    return response.data;
  },

  async deleteAppeal(id: number) {
    const response = await api.delete(`/appeals/${id}`);
    return response.data;
  },
};

