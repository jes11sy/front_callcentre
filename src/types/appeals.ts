export type AppealStatus = 'new' | 'in_progress' | 'waiting' | 'closed_solved' | 'closed_rejected';

export interface Appeal {
  id: number;
  phone: string;
  clientName?: string;
  description: string;
  status: AppealStatus;
  statusId?: number;
  statusName?: string;
  statusColor?: string;
  callId?: string | number;
  siteOrderId?: number;
  operator?: { id: number; name: string };
  cityId?: number;
  rkId?: number;
  source?: string;
  cityName?: string;
  rkName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppealsResponse {
  data: Appeal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  new: 'Новое',
  in_progress: 'В работе',
  waiting: 'Ожидает',
  closed_solved: 'Решено',
  closed_rejected: 'Отклонено',
};

export const APPEAL_STATUS_COLORS: Record<AppealStatus, string> = {
  new: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30',
  in_progress: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
  waiting: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30',
  closed_solved: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30',
  closed_rejected: 'bg-gray-100 dark:bg-gray-600/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30',
};

export const APPEAL_STATUS_FLOW: AppealStatus[] = [
  'new',
  'in_progress',
  'waiting',
  'closed_solved',
  'closed_rejected',
];

