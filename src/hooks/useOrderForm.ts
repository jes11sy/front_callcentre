// Базовый хук для форм заказов - устраняет дублирование кода
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  orderBaseSchema, 
  chatOrderSchema, 
  callOrderSchema, 
  fullOrderSchema,
  type OrderBaseFormData,
  type ChatOrderFormData,
  type CallOrderFormData,
  type FullOrderFormData
} from '@/lib/validation-schemas';

// Типы для разных форм
type OrderFormType = 'chat' | 'call' | 'full';

interface UseOrderFormOptions {
  type: OrderFormType;
  defaultValues?: Partial<OrderBaseFormData>;
  onSubmit: (data: any) => Promise<void>;
}

export function useOrderForm({ type, defaultValues, onSubmit }: UseOrderFormOptions) {
  // Выбираем схему в зависимости от типа формы
  const getSchema = () => {
    switch (type) {
      case 'chat':
        return chatOrderSchema;
      case 'call':
        return callOrderSchema;
      case 'full':
        return fullOrderSchema;
      default:
        return orderBaseSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      typeOrder: 'Впервые',
      clientName: '',
      phone: '',
      address: '',
      dateMeeting: '',
      typeEquipment: 'КП',
      problem: '',
      ...defaultValues
    }
  });

  // Обработка отправки формы с единой логикой ошибок
  const handleSubmit = useCallback(async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      console.error('Error submitting order form:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при создании заказа';
      toast.error(errorMessage);
    }
  }, [onSubmit]);

  // Очистка формы
  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  // Установка значений формы
  const setFormValue = useCallback((field: string, value: any) => {
    form.setValue(field as any, value);
  }, [form]);

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
    setFormValue
  };
}

// Хук для обработки ошибок API
export function useApiErrorHandler() {
  const handleError = useCallback((error: unknown, defaultMessage: string = 'Произошла ошибка') => {
    console.error('API Error:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || defaultMessage;
    toast.error(errorMessage);
  }, []);

  return { handleError };
}

// Хук для успешных операций
export function useSuccessHandler() {
  const handleSuccess = useCallback((message: string = 'Операция выполнена успешно') => {
    toast.success(message);
  }, []);

  return { handleSuccess };
}
