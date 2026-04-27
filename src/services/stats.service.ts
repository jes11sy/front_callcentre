import api from '@/lib/api';

export const statsService = {
  async getMyStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/stats/my?${params.toString()}`);
    return response.data;
  },
};

