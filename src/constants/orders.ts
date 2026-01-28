export const STATUS_LABELS = {
  'Ожидает': 'Ожидает',
  'Принял': 'Принял',
  'В пути': 'В пути',
  'В работе': 'В работе',
  'Готово': 'Готово',
  'Отказ': 'Отказ',
  'Модерн': 'Модерн',
  'Незаказ': 'Незаказ'
} as const;

export const STATUS_COLORS = {
  'Ожидает': 'bg-amber-900 text-amber-200 border-amber-600',
  'Принял': 'bg-blue-900 text-blue-200 border-blue-600',
  'В пути': 'bg-indigo-900 text-indigo-200 border-indigo-600',
  'В работе': 'bg-yellow-900 text-yellow-200 border-yellow-600',
  'Готово': 'bg-green-900 text-green-200 border-green-600',
  'Отказ': 'bg-red-900 text-red-200 border-red-600',
  'Модерн': 'bg-orange-900 text-orange-200 border-orange-600',
  'Незаказ': 'bg-gray-800 text-gray-300 border-gray-600'
} as const;

export const ORDER_TYPES = [
  { value: 'Впервые', label: 'Впервые' },
  { value: 'Повтор', label: 'Повтор' },
  { value: 'Гарантия', label: 'Гарантия' }
] as const;

export const EQUIPMENT_TYPES = [
  { value: 'КП', label: 'КП (Компьютерная помощь)' },
  { value: 'БТ', label: 'БТ (Бытовая техника)' },
  { value: 'МНЧ', label: 'МНЧ (Муж на час)' }
] as const;

export const CITIES = [
  { value: 'Саратов', label: 'Саратов' },
  { value: 'Энгельс', label: 'Энгельс' },
  { value: 'Ульяновск', label: 'Ульяновск' },
  { value: 'Тольятти', label: 'Тольятти' },
  { value: 'Пенза', label: 'Пенза' },
  { value: 'Ярославль', label: 'Ярославль' },
  { value: 'Омск', label: 'Омск' }
] as const;


export const STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'Ожидает', label: 'Ожидает' },
  { value: 'Принял', label: 'Принял' },
  { value: 'В пути', label: 'В пути' },
  { value: 'В работе', label: 'В работе' },
  { value: 'Готово', label: 'Готово' },
  { value: 'Отказ', label: 'Отказ' },
  { value: 'Модерн', label: 'Модерн' },
  { value: 'Незаказ', label: 'Незаказ' }
] as const;

export const PAGE_SIZES = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' }
] as const;

export const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10;
  const minute = (i % 2) * 30;
  return {
    hour,
    minute,
    timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    index: i
  };
});

export const EQUIPMENT_TYPE_COLORS = {
  'КП': 'text-blue-400',
  'БТ': 'text-green-400',
  'МНЧ': 'text-orange-400'
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;
