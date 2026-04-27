export interface Profile {
  id: number;
  name: string;
  login: string;
  city: string;
  status: string;
  statusWork?: string;
  passport?: string;
  contract?: string;
  createdAt: string;
  dateCreate?: string;
  note?: string;
  role: string;
  updatedAt: string;
  _count?: {
    calls: number;
    orders: number;
  };
}

export interface ProfileStats {
  operator: {
    id: number;
    name: string;
    city: string;
    startDate: string;
  };
  total: {
    calls: number;
    orders: number;
  };
  monthly: {
    calls: number;
    orders: number;
  };
  today: {
    calls: number;
    orders: number;
  };
}

export interface PeriodStats {
  calls: {
    total: number;
    accepted: number;
    missed: number;
    acceptanceRate: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
  };
  dailyStats: Array<{ date: string; calls: number }>;
}

