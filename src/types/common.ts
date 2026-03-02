// Общие типы для устранения дублирования кода

// Базовые поля заказа
export interface BaseOrderFields {
  typeOrder: 'Впервые' | 'Повтор' | 'Гарантия';
  clientName: string;
  phone: string;
  address: string;
  dateMeeting: string;
  equipmentTypeId: number;
  equipmentType?: { id: number; name: string };
}

// Оператор
export interface Operator {
  id: number;
  name: string;
  login: string;
}

// Авито аккаунт
export interface AvitoAccount {
  id: number;
  name: string;
}

// Базовый заказ
export interface BaseOrder extends BaseOrderFields {
  id: number;
  rkId: number;
  rk?: { id: number; name: string };
  cityId: number;
  city?: { id: number; name: string };
  callRecord?: string;
  statusId: number;
  status?: { id: number; name: string; code: string };
  result?: number;
  expenditure?: number;
  clean?: number;
  bsoDoc?: string[];
  expenditureDoc?: string[];
  masterId?: number;
  operatorId: number;
  createdAt: string;
  closingAt?: string;
  updatedAt: string;
  operator: Operator;
  avito?: AvitoAccount;
  master?: {
    id: number;
    name: string;
  };
  callId?: string;
}

// Данные для создания заказа из чата
export interface CreateOrderFromChatData extends BaseOrderFields {
  chatId: string;
  rkId: number;
  cityId: number;
  avitoChatId: string;
}

// Данные для создания заказа из звонка
export interface CreateOrderFromCallData extends BaseOrderFields {
  callId: number;
  rkId: number;
  cityId: number;
}

// Данные для создания заказа с нуля
export interface CreateOrderData extends BaseOrderFields {
  rkId: number;
  cityId: number;
  operatorId: number;
}

// API ответы
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Модальные окна
export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OrderModalProps extends ModalProps {
  onOrderCreated?: (order: BaseOrder) => void;
}

// Формы
export interface FormFieldProps {
  register?: unknown;
  control?: unknown;
  errors: Record<string, { message?: string }>;
  className?: string;
}

// Уведомления
export interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
