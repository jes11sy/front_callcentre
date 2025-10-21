// API клиент для устранения дублирования кода в запросах
import { CreateOrderFromChatData, CreateOrderFromCallData, CreateOrderData, ApiResponse } from '@/types/common';

// Базовый URL API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Получение токена авторизации
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Базовые заголовки для запросов
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Базовый fetch с обработкой ошибок
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API для заказов
export const ordersApi = {
  // Создание заказа с нуля
  async create(data: CreateOrderData): Promise<ApiResponse> {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Создание заказа из чата
  async createFromChat(data: CreateOrderFromChatData): Promise<ApiResponse> {
    return apiRequest('/api/orders/from-chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Создание заказа из звонка
  async createFromCall(data: CreateOrderFromCallData): Promise<ApiResponse> {
    return apiRequest('/api/orders/from-call', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Получение заказов
  async getOrders(params?: URLSearchParams): Promise<ApiResponse> {
    const queryString = params ? `?${params.toString()}` : '';
    return apiRequest(`/api/orders${queryString}`);
  },

  // Получение заказа по ID
  async getOrderById(id: number): Promise<ApiResponse> {
    return apiRequest(`/api/orders/${id}`);
  },

  // Обновление заказа
  async updateOrder(id: number, data: Partial<CreateOrderData>): Promise<ApiResponse> {
    return apiRequest(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Обновление статуса заказа
  async updateStatus(id: number, status: string): Promise<ApiResponse> {
    return apiRequest(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// API для звонков
export const callsApi = {
  // Получение звонков
  async getCalls(params?: URLSearchParams): Promise<ApiResponse> {
    const queryString = params ? `?${params.toString()}` : '';
    return apiRequest(`/api/calls${queryString}`);
  },

  // Получение звонка по ID
  async getCallById(id: number): Promise<ApiResponse> {
    return apiRequest(`/api/calls/${id}`);
  },

  // Получение истории заказов по телефону
  async getOrderHistory(phone: string): Promise<ApiResponse> {
    return apiRequest(`/api/orders?search=${encodeURIComponent(phone)}`);
  }
};

// API для чатов
export const chatsApi = {
  // Получение чатов
  async getChats(): Promise<ApiResponse> {
    return apiRequest('/api/chats');
  },

  // Получение сообщений чата
  async getChatMessages(chatId: string): Promise<ApiResponse> {
    return apiRequest(`/api/chats/${chatId}/messages`);
  },

  // Отправка сообщения
  async sendMessage(chatId: string, message: string): Promise<ApiResponse> {
    return apiRequest(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
};

// Утилиты для работы с API
export const apiUtils = {
  // Создание URLSearchParams из объекта
  createSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams;
  },

  // Обработка ошибок API
  handleApiError(error: unknown, defaultMessage: string = 'Произошла ошибка'): string {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as { response?: { data?: { message?: string } } };
      return apiError.response?.data?.message || defaultMessage;
    }
    
    return defaultMessage;
  },

  // Проверка успешности ответа
  isSuccessResponse(response: ApiResponse): boolean {
    return response.success === true;
  }
};
