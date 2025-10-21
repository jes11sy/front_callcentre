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
  typeEquipment: z.enum(['КП', 'БТ', 'МНЧ']).refine((val) => val !== undefined, {
    message: 'Выберите тип техники'
  }),
  problem: z.string().min(1, 'Описание проблемы обязательно')
});

// Схема для создания заказа из чата (минимальные поля)
export const chatOrderSchema = orderBaseSchema;

// Схема для создания заказа из звонка (дополнительные поля)
export const callOrderSchema = orderBaseSchema.extend({
  rk: z.enum(['Авито', 'Листовка']),
  avitoName: z.string().optional(),
  city: z.string().min(1, 'Введите город')
});

// Схема для создания заказа с нуля (все поля)
export const fullOrderSchema = orderBaseSchema.extend({
  rk: z.string().min(1, 'РК обязателен'),
  city: z.string().min(1, 'Город обязателен'),
  avitoName: z.string().optional()
});

// Типы для форм
export type OrderBaseFormData = z.infer<typeof orderBaseSchema>;
export type ChatOrderFormData = z.infer<typeof chatOrderSchema>;
export type CallOrderFormData = z.infer<typeof callOrderSchema>;
export type FullOrderFormData = z.infer<typeof fullOrderSchema>;

// Константы для селектов
export const ORDER_TYPE_OPTIONS = [
  { value: 'Впервые', label: 'Впервые' },
  { value: 'Повтор', label: 'Повтор' },
  { value: 'Гарантия', label: 'Гарантия' }
] as const;

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: 'КП', label: 'КП' },
  { value: 'БТ', label: 'БТ' },
  { value: 'МНЧ', label: 'МНЧ' }
] as const;

export const RK_OPTIONS = [
  { value: 'Авито', label: 'Авито' },
  { value: 'Листовка', label: 'Листовка' }
] as const;
