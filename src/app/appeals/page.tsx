'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDesignStore } from '@/store/designStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  Loader2,
  AlertCircle,
  MessageSquare,
  Phone,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CreateAppealModal } from '@/components/appeals/CreateAppealModal';

export const dynamic = 'force-dynamic';

export type AppealStatus = 'new' | 'in_progress' | 'waiting_client' | 'closed_resolved' | 'closed_refused';
export type AppealCategory = 'question' | 'complaint' | 'order' | 'consultation' | 'callback';

export interface Appeal {
  id: number;
  clientPhone: string;
  clientName?: string;
  category: AppealCategory;
  description: string;
  result?: string;
  status: AppealStatus;
  callId?: number;
  siteOrderId?: number;
  orderId?: number;
  operator?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

interface AppealsResponse {
  data: Appeal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const STATUS_LABELS: Record<AppealStatus, string> = {
  new: 'Новое',
  in_progress: 'В работе',
  waiting_client: 'Ожидает клиента',
  closed_resolved: 'Закрыто (решено)',
  closed_refused: 'Закрыто (отказ)',
};

export const STATUS_COLORS: Record<AppealStatus, string> = {
  new: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30',
  in_progress: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
  waiting_client: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30',
  closed_resolved: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30',
  closed_refused: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30',
};

export const CATEGORY_LABELS: Record<AppealCategory, string> = {
  question: 'Вопрос',
  complaint: 'Жалоба',
  order: 'Заказ',
  consultation: 'Консультация',
  callback: 'Перезвон',
};

const STATUS_FLOW: AppealStatus[] = [
  'new',
  'in_progress',
  'waiting_client',
  'closed_resolved',
  'closed_refused',
];

export default function AppealsPage() {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState<Appeal | null>(null);
  const [detailAppeal, setDetailAppeal] = useState<Appeal | null>(null);

  const { data, isLoading, error } = useQuery<AppealsResponse>({
    queryKey: ['appeals', page, search, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      const response = await api.get(`/appeals?${params.toString()}`);
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AppealStatus }) => {
      const response = await api.patch(`/appeals/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      toast.success('Статус обновлён');
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/appeals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      setDetailAppeal(null);
      toast.success('Обращение удалено');
    },
    onError: () => toast.error('Ошибка при удалении'),
  });

  const handleOpenCreate = () => {
    setEditingAppeal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (appeal: Appeal) => {
    setEditingAppeal(appeal);
    setDetailAppeal(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить обращение?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FEC004]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#F3F3EE] dark:bg-[#111827]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 dark:text-red-400 text-gray-700">Ошибка загрузки обращений</p>
            <p className="text-sm text-gray-500 mt-1">API /appeals не подключён к бэкенду</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`w-full py-4 px-4 min-h-screen font-myriad transition-colors ${
        isDark ? 'bg-[#111827]' : 'bg-[#F3F3EE]'
      }`}>
        <div className="w-full flex gap-4">

          {/* Основная таблица */}
          <div className={`flex-1 min-w-0 ${detailAppeal ? 'hidden sm:block' : ''}`}>

            {/* Фильтры */}
            <div className={`rounded-lg p-4 mb-4 border ${isDark ? 'bg-[#1e2530] border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Поиск по телефону, имени, описанию..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className={`h-9 ${isDark ? 'bg-[#252d3a] border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div className="w-[160px]">
                  <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className={`h-9 ${isDark ? 'bg-[#252d3a] border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#252d3a] border-gray-600' : 'bg-white border-gray-200'}>
                      <SelectItem value="all" className={isDark ? 'text-gray-200' : 'text-gray-700'}>Все статусы</SelectItem>
                      {STATUS_FLOW.map((s) => (
                        <SelectItem key={s} value={s} className={isDark ? 'text-gray-200' : 'text-gray-700'}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[150px]">
                  <Select value={categoryFilter || 'all'} onValueChange={(v) => { setCategoryFilter(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className={`h-9 ${isDark ? 'bg-[#252d3a] border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#252d3a] border-gray-600' : 'bg-white border-gray-200'}>
                      <SelectItem value="all" className={isDark ? 'text-gray-200' : 'text-gray-700'}>Все категории</SelectItem>
                      {(Object.entries(CATEGORY_LABELS) as [AppealCategory, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k} className={isDark ? 'text-gray-200' : 'text-gray-700'}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleOpenCreate}
                  className="h-9 bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-semibold ml-auto"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Обращение
                </Button>
              </div>
            </div>

            {/* Статистика */}
            {data?.data && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {STATUS_FLOW.map((s) => {
                  const count = data.data.filter((a) => a.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        statusFilter === s
                          ? isDark ? 'bg-[#FEC004]/20 border-[#FEC004]/50' : 'bg-[#FEC004]/10 border-[#FEC004]/40'
                          : isDark ? 'bg-[#1e2530] border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-xl font-light ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{count}</div>
                      <div className={`text-xs font-light leading-tight mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{STATUS_LABELS[s]}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Таблица */}
            <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-[#1e2530] border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-[#252d3a] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Клиент</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Категория</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Описание</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Статус</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Дата</th>
                      <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((appeal) => (
                        <tr
                          key={appeal.id}
                          onClick={() => setDetailAppeal(appeal)}
                          className={`border-b cursor-pointer transition-colors ${
                            detailAppeal?.id === appeal.id
                              ? isDark ? 'bg-[#FEC004]/10' : 'bg-[#FEC004]/5'
                              : isDark ? 'border-gray-700 hover:bg-[#252d3a]' : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{appeal.id}</td>
                          <td className="px-4 py-3">
                            <div className={`text-sm font-mono font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {appeal.clientPhone}
                            </div>
                            {appeal.clientName && (
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{appeal.clientName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              appeal.category === 'complaint'
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
                                : appeal.category === 'callback'
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                            }`}>
                              {CATEGORY_LABELS[appeal.category]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`text-sm max-w-[250px] truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {appeal.description}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={appeal.status}
                              onValueChange={(v) => {
                                updateStatusMutation.mutate({ id: appeal.id, status: v as AppealStatus });
                              }}
                            >
                              <SelectTrigger
                                onClick={(e) => e.stopPropagation()}
                                className={`w-[160px] h-7 text-xs border ${STATUS_COLORS[appeal.status]} bg-transparent focus-visible:ring-0`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={isDark ? 'bg-[#252d3a] border-gray-600' : 'bg-white border-gray-200'}>
                                {STATUS_FLOW.map((s) => (
                                  <SelectItem key={s} value={s} className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                                    {STATUS_LABELS[s]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(appeal.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(appeal)}
                                className={`h-7 w-7 p-0 ${isDark ? 'text-gray-400 hover:text-[#FEC004]' : 'text-gray-500 hover:text-[#FEC004]'}`}
                                title="Редактировать"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(appeal.id)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                title="Удалить"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <MessageSquare className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Обращений не найдено</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Показано {data.data.length} из {data.pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`${isDark ? 'border-gray-600 text-gray-300 hover:bg-[#FEC004]/10' : 'border-gray-200 text-gray-700 hover:bg-[#FEC004]/10'} hover:text-[#FEC004] hover:border-[#FEC004]`}
                    >
                      Назад
                    </Button>
                    <span className={`px-3 py-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {page} / {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                      className={`${isDark ? 'border-gray-600 text-gray-300 hover:bg-[#FEC004]/10' : 'border-gray-200 text-gray-700 hover:bg-[#FEC004]/10'} hover:text-[#FEC004] hover:border-[#FEC004]`}
                    >
                      Далее
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель детали обращения */}
          {detailAppeal && (
            <div className={`w-full sm:w-[360px] shrink-0 rounded-lg border overflow-hidden self-start sticky top-4 ${
              isDark ? 'bg-[#1e2530] border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {/* Шапка */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-[#252d3a]' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Обращение #{detailAppeal.id}
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(detailAppeal)}
                    className={`h-8 w-8 p-0 ${isDark ? 'text-gray-400 hover:text-[#FEC004]' : 'text-gray-500 hover:text-[#FEC004]'}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailAppeal(null)}
                    className={`h-8 w-8 p-0 ${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Клиент */}
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Клиент</p>
                  <div className="flex items-center gap-2">
                    <Phone className={`h-4 w-4 shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`font-mono text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{detailAppeal.clientPhone}</span>
                  </div>
                  {detailAppeal.clientName && (
                    <p className={`text-sm mt-1 ml-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{detailAppeal.clientName}</p>
                  )}
                </div>

                {/* Статус / Категория */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[detailAppeal.status]}`}>
                    {STATUS_LABELS[detailAppeal.status]}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${
                    isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {CATEGORY_LABELS[detailAppeal.category]}
                  </span>
                </div>

                {/* Описание */}
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Что хотел клиент</p>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{detailAppeal.description}</p>
                </div>

                {/* Итог */}
                {detailAppeal.result && (
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Итог разговора</p>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{detailAppeal.result}</p>
                  </div>
                )}

                {/* Привязки */}
                <div className="space-y-1.5">
                  {detailAppeal.callId && (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Звонок: <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>#{detailAppeal.callId}</span></p>
                  )}
                  {detailAppeal.orderId && (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Заказ: <span className="text-[#FEC004]">#{detailAppeal.orderId}</span></p>
                  )}
                  {detailAppeal.siteOrderId && (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Заявка с сайта: <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>#{detailAppeal.siteOrderId}</span></p>
                  )}
                  {detailAppeal.operator && (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Оператор: <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{detailAppeal.operator.name}</span></p>
                  )}
                </div>

                {/* Дата */}
                <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {new Date(detailAppeal.createdAt).toLocaleString('ru-RU')}
                </p>

                {/* Кнопки смены статуса */}
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Изменить статус</p>
                  <div className="flex flex-col gap-1.5">
                    {STATUS_FLOW.filter((s) => s !== detailAppeal.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          updateStatusMutation.mutate({ id: detailAppeal.id, status: s });
                          setDetailAppeal({ ...detailAppeal, status: s });
                        }}
                        className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${STATUS_COLORS[s]} opacity-80 hover:opacity-100`}
                      >
                        → {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Удалить */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(detailAppeal.id)}
                  className="w-full text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить обращение
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateAppealModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appeal={editingAppeal}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['appeals'] });
          setIsModalOpen(false);
          setEditingAppeal(null);
        }}
      />
    </DashboardLayout>
  );
}
