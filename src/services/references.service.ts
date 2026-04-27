import api from '@/lib/api';

interface NamedEntity {
  id: number;
  name: string;
}

interface OrderStatus {
  id: number;
  name: string;
  code: string;
  color: string;
  group: string;
  sortOrder: number;
  isActive: boolean;
}

export const referencesService = {
  async getCities(): Promise<NamedEntity[]> {
    const response = await api.get('/references/cities', { params: { isActive: true } });
    return (response.data?.data || []).map((city: NamedEntity) => ({ id: city.id, name: city.name }));
  },

  async getRks(): Promise<NamedEntity[]> {
    const response = await api.get('/references/rk', { params: { isActive: true } });
    return (response.data?.data || []).map((rk: NamedEntity) => ({ id: rk.id, name: rk.name }));
  },

  async getEquipmentTypes(): Promise<NamedEntity[]> {
    const response = await api.get('/references/equipment-types', { params: { isActive: true } });
    return (response.data?.data || []).map((equipment: NamedEntity) => ({ id: equipment.id, name: equipment.name }));
  },

  async getOrderStatuses(group?: 'appeal' | 'order'): Promise<OrderStatus[]> {
    const response = await api.get('/references/order-statuses');
    const all: OrderStatus[] = response.data?.data || [];

    if (group) {
      return all.filter((status) => status.group === group && status.isActive);
    }

    return all.filter((status) => status.isActive);
  },

  async getSources(): Promise<string[]> {
    const response = await api.get('/phones/sources');
    return response.data?.data || [];
  },

  async getOperators() {
    const response = await api.get('/operators');
    return response.data;
  },
};

