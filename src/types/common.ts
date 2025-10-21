// Общие типы для устранения дублирования кода

// Базовые поля заказа
export interface BaseOrderFields {
  typeOrder: 'Впервые' | 'Повтор' | 'Гарантия';
  clientName: string;
  phone: string;
  address: string;
  dateMeeting: string;
  typeEquipment: 'КП' | 'БТ' | 'МНЧ';
  problem: string;
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
  rk: string;
  city: string;
  avitoName?: string;
  avitoChatId?: string;
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
  createdAt: string;
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
  rk: 'Авито';
  city: string;
  avitoName: string;
  avitoChatId: string;
}

// Данные для создания заказа из звонка
export interface CreateOrderFromCallData extends BaseOrderFields {
  callId: number;
  rk: 'Авито' | 'Листовка';
  avitoName?: string;
  city: string;
}

// Данные для создания заказа с нуля
export interface CreateOrderData extends BaseOrderFields {
  rk: string;
  city: string;
  avitoName?: string;
  operatorNameId: number;
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
  register?: any;
  control?: any;
  errors: any;
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
