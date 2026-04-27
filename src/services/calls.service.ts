import api from '@/lib/api';
import { unwrapApiData } from '@/lib/http/unwrap';
import type { Call } from '@/types/orders';

export const callsService = {
  async getCallById(callId: string): Promise<Call | null> {
    const response = await api.get(`/calls/${callId}`);
    const call = unwrapApiData<Call | null>(response.data);
    return call;
  },
};

