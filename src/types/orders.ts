export interface Order {
  id: number;
  rk: string;
  city: string;
  avitoName?: string;
  avitoChatId?: string;
  phone: string;
  typeOrder: string;
  clientName: string;
  address: string;
  dateMeeting: string;
  typeEquipment: string;
  problem: string;
  callRecord?: string;
  statusOrder: string;
  result?: number;
  expenditure?: number;
  clean?: number;
  bsoDoc?: string;
  expenditureDoc?: string;
  masterId?: number;
  operatorNameId: number;
  createDate: string;
  closingData?: string;
  updatedAt?: string;
  operator: {
    id: number;
    name: string;
    login: string;
  };
  avito?: {
    id: number;
    name: string;
  };
  master?: {
    id: number;
    name: string;
  };
  callId?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AudioPlayerState {
  audio: HTMLAudioElement | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  currentCallId: number | null;
}

export interface OrderFilters {
  search: string;
  status: string;
  city: string;
  master: string;
  closingDate: string;
}

export type OrderTab = 'description' | 'master' | 'documents';

export interface Call {
  id: number;
  dateCreate: string;
  recordingPath?: string;
}

export interface Employee {
  id: number;
  name: string;
  login: string;
  statusWork: 'active' | 'inactive' | 'on_call' | 'break';
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  login: string;
  password?: string;
  statusWork: 'active' | 'inactive' | 'on_call' | 'break';
  role: string;
}

export interface OverallStats {
  totalOrders: number;
  totalRevenue: number;
  totalCalls: number;
  averageOrderValue: number;
  conversionRate: number;
  operatorStats: OperatorStats[];
}

export interface OperatorStats {
  operatorId: number;
  operatorName: string;
  totalOrders: number;
  totalRevenue: number;
  totalCalls: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface LoginCredentials {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const typeOrderLabels: Record<string, string> = {
  'Впервые': 'Первичный заказ',
  'Повтор': 'Повторный заказ', 
  'Гарантия': 'Гарантийный случай'
};