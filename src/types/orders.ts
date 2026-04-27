export interface Order {
  id: number;
  rkId: number;
  rk?: { id: number; name: string };
  rkName?: string;
  cityId: number;
  city?: { id: number; name: string };
  cityName?: string;
  phone: string;
  typeOrder?: string;
  orderTypeName?: string;
  clientName: string;
  address?: string;
  dateMeeting?: string;
  equipmentTypeId?: number;
  equipmentType?: { id: number; name: string };
  equipmentTypeName?: string;
  callRecord?: string;
  statusId: number;
  status?: { id: number; name: string; code: string };
  statusName?: string;
  statusCode?: string;
  statusColor?: string;
  result?: number;
  expenditure?: number;
  clean?: number;
  masterChange?: number;
  prepayment?: number;
  bsoDoc?: string[];
  expenditureDoc?: string[];
  masterId?: number;
  operatorId: number;
  createdAt: string;
  closingAt?: string;
  updatedAt?: string;
  description?: string;
  source?: string;
  siteOrderId?: number;
  problem?: string;
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
  documents?: Array<{ id: number; type: string; url: string; createdAt: string }>;
  comments?: Array<{ id: number; role: string; userId: number; text: string; createdAt: string }>;
  cashSubmission?: { status: string; amount: number; submittedAt: string; approvedAt: string } | null;
  hasPoverka?: boolean;
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
  searchId: string;
  searchPhone: string;
  searchAddress: string;
  status: string;
  cityId: string;
  master: string;
  closingDate: string;
}

export type OrderTab = 'description' | 'master' | 'documents';

export interface Call {
  id: number;
  createdAt: string;
  phoneClient?: string;
  status?: 'answered' | 'missed' | 'busy' | 'no_answer';
  duration?: number;
  operator?: {
    id: number;
    name: string;
    login: string;
  };
  recordingPath?: string;
}

export interface Employee {
  id: number;
  name: string;
  login: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  login: string;
  password?: string;
  status: 'active' | 'inactive';
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

export interface OrderHistoryItem {
  id: number;
  timestamp: string;
  eventType: 'order.create' | 'order.update' | 'order.close' | 'order.status.change';
  userId?: number;
  role?: string;
  login?: string;
  userName?: string;
  metadata?: {
    orderId?: number;
    changes?: Record<string, { old: string | number | null; new: string | number | null }>;
    oldStatus?: string;
    newStatus?: string;
    result?: string;
    expenditure?: string;
    clean?: string;
    city?: string;
    clientName?: string;
    phone?: string;
  };
}