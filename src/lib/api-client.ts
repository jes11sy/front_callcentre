// 🍪 API клиент с httpOnly cookies поддержкой
import { CreateOrderFromChatData, CreateOrderFromCallData, CreateOrderData, ApiResponse } from '@/types/common';
import api from '@/lib/api'; // Используем настроенный axios instance

// API для заказов
export const ordersApi = {
  // Создание заказа с нуля
  async create(data: CreateOrderData): Promise<ApiResponse> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Создание заказа из чата
  async createFromChat(data: CreateOrderFromChatData): Promise<ApiResponse> {
    const response = await api.post('/orders/from-chat', data);
    return response.data;
  },

  // Создание заказа из звонка
  async createFromCall(data: CreateOrderFromCallData): Promise<ApiResponse> {
    const response = await api.post('/orders/from-call', data);
    return response.data;
  },

  // Получение заказов
  async getOrders(params?: URLSearchParams): Promise<ApiResponse> {
    const queryString = params ? `?${params.toString()}` : '';
    const response = await api.get(`/orders${queryString}`);
    return response.data;
  },

  // Получение заказа по ID
  async getOrderById(id: number): Promise<ApiResponse> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Обновление заказа
  async updateOrder(id: number, data: Partial<CreateOrderData>): Promise<ApiResponse> {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  // Обновление статуса заказа
  async updateStatus(id: number, status: string): Promise<ApiResponse> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Получение опций для фильтров (включая города)
  async getFilterOptions(): Promise<ApiResponse> {
    const response = await api.get('/orders/filter-options');
    return response.data;
  }
};

// API для звонков
export const callsApi = {
  // Получение звонков
  async getCalls(params?: URLSearchParams): Promise<ApiResponse> {
    const queryString = params ? `?${params.toString()}` : '';
    const response = await api.get(`/calls${queryString}`);
    return response.data;
  },

  // Получение звонка по ID
  async getCallById(id: number): Promise<ApiResponse> {
    const response = await api.get(`/calls/${id}`);
    return response.data;
  },

  // Получение истории заказов по телефону
  async getOrderHistory(phone: string): Promise<ApiResponse> {
    const response = await api.get(`/orders?search=${encodeURIComponent(phone)}`);
    return response.data;
  }
};

// API для чатов
export const chatsApi = {
  // Получение чатов
  async getChats(): Promise<ApiResponse> {
    const response = await api.get('/chats');
    return response.data;
  },

  // Получение сообщений чата
  async getChatMessages(chatId: string): Promise<ApiResponse> {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  // Отправка сообщения
  async sendMessage(chatId: string, message: string): Promise<ApiResponse> {
    const response = await api.post(`/chats/${chatId}/messages`, { message });
    return response.data;
  }
};

// API для cash (касса/штрафы)
export const cashApi = {
  // Получение транзакций
  async getCashTransactions(params?: { name?: string; city?: string; paymentPurpose?: string; limit?: number }): Promise<ApiResponse> {
    const searchParams = params ? apiUtils.createSearchParams(params) : new URLSearchParams();
    const queryString = searchParams.toString();
    const response = await api.get(`/cash${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Создание транзакции
  async createCashTransaction(data: any): Promise<ApiResponse> {
    const response = await api.post('/cash', data);
    return response.data;
  },

  // Обновление транзакции
  async updateCashTransaction(id: string, data: any): Promise<ApiResponse> {
    const response = await api.put(`/cash/${id}`, data);
    return response.data;
  },

  // Удаление транзакции
  async deleteCashTransaction(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/cash/${id}`);
    return response.data;
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
