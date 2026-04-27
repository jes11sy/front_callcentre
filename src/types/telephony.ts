export interface Call {
  id: number;
  rkId?: number;
  rk?: { id: number; name: string };
  cityId?: number;
  city?: { id: number; name: string };
  phoneClient: string;
  phoneAts: string;
  createdAt: string;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  /** Направление звонка: inbound - входящий, outbound - исходящий, callback - обратный звонок */
  callDirection: 'inbound' | 'outbound' | 'callback';
  /** ID мастера для callback-звонков */
  masterId?: number | null;
  /** Имя мастера для callback-звонков */
  masterName?: string | null;
  recordingPath?: string;
  recordingProcessedAt?: string;
  // Поля от Mango Office
  callId?: string;
  duration?: number;
  mangoData?: Record<string, unknown>;
  operator: {
    id: number;
    name: string;
    login: string;
  };
  orderId?: number | null;
  source?: string | null;
  cityName?: string | null;
  rkName?: string | null;
  avito?: {
    id: number;
    name: string;
  };
}

export interface CallsResponse {
  success: boolean;
  data: {
    calls: Call[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CallFilters {
  dateFrom?: string;
  dateTo?: string;
  cityId?: string;
  rkId?: string;
  status?: string;
}

export interface Phone {
  id: number;
  number: string;
  rkId: number;
  rk?: { id: number; name: string };
  cityId: number;
  city?: { id: number; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneFormData {
  number: string;
  rkId: number;
  cityId: number;
}


