export interface Call {
  id: number;
  rk: string;
  city: string;
  avitoName?: string;
  phoneClient: string;
  phoneAts: string;
  dateCreate: string;
  status: 'answered' | 'missed' | 'busy' | 'no_answer';
  recordingPath?: string;
  recordingEmailSent?: boolean;
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
  avito?: {
    id: number;
    name: string;
  };
  phone?: {
    id: number;
    number: string;
    rk: string;
    city: string;
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
  city?: string;
  rk?: string;
  status?: string;
  avitoName?: string;
}

export interface Phone {
  id: number;
  number: string;
  rk: string;
  city: string;
  avitoName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneFormData {
  number: string;
  rk: string;
  city: string;
  avitoName?: string;
}


