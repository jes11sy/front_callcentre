// Общие схемы валидации для устранения дублирования кода
import { z } from 'zod';

// Базовые поля заказа
export const orderBaseSchema = z.object({
  typeOrder: z.enum(['Впервые', 'Повтор', 'Гарантия']).refine((val) => val !== undefined, {
    message: 'Выберите тип заявки'
  }),
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  phone: z.string().min(1, 'Номер телефона обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  dateMeeting: z.string().min(1, 'Дата встречи обязательна'),
  equipmentTypeId: z.number({ required_error: 'Выберите тип техники' }).min(1, 'Выберите тип техники'),
});

// Единая схема заказа с rkId и cityId (используется для создания из чата, звонка и с нуля)
export const orderWithLocationSchema = orderBaseSchema.extend({
  rkId: z.number({ required_error: 'РК обязателен' }).min(1, 'РК обязателен'),
  cityId: z.number({ required_error: 'Город обязателен' }).min(1, 'Город обязателен'),
});

// Алиасы для обратной совместимости
export const chatOrderSchema = orderWithLocationSchema;
export const callOrderSchema = orderWithLocationSchema;
export const fullOrderSchema = orderWithLocationSchema;

// Типы для форм
export type OrderBaseFormData = z.infer<typeof orderBaseSchema>;
export type OrderWithLocationFormData = z.infer<typeof orderWithLocationSchema>;
export type ChatOrderFormData = OrderWithLocationFormData;
export type CallOrderFormData = OrderWithLocationFormData;
export type FullOrderFormData = OrderWithLocationFormData;

// Константы для селектов
export const ORDER_TYPE_OPTIONS = [
  { value: 'Впервые', label: 'Впервые' },
  { value: 'Повтор', label: 'Повтор' },
  { value: 'Гарантия', label: 'Гарантия' }
] as const;

// Equipment types and RK options are now fetched dynamically from /orders/filter-options
// These constants are kept for reference only
export const EQUIPMENT_TYPE_OPTIONS_LEGACY = [
  { value: 'КП', label: 'КП' },
  { value: 'БТ', label: 'БТ' },
  { value: 'МНЧ', label: 'МНЧ' }
] as const;
