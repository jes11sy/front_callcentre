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
import { CreateAppealModal } from '@/components/appeals/CreateAppealModal';
import { getFormFieldClass, getFormSelectContentClass, getFormSelectItemClass, getFormSelectTriggerClass } from '@/components/ui/form-styles';
import { appealsService } from '@/services';
import {
  APPEAL_STATUS_COLORS,
  APPEAL_STATUS_FLOW,
  APPEAL_STATUS_LABELS,
  type Appeal,
  type AppealStatus,
  type AppealsResponse,
} from '@/types/appeals';

export const dynamic = 'force-dynamic';


export default function AppealsPage() {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState<Appeal | null>(null);
  const [detailAppeal, setDetailAppeal] = useState<Appeal | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<AppealsResponse>({
    queryKey: ['appeals', page, search, statusFilter],
    queryFn: async () => {
      return appealsService.getAppeals({
        page,
        limit: 50,
        search,
        status: statusFilter,
      });
    },
  });

  const { data: statsData } = useQuery<{ success: boolean; data: { total: number; byStatus: Record<string, number> } }>({
    queryKey: ['appeals-stats'],
    queryFn: async () => {
      return appealsService.getAppealsStats();
    },
    staleTime: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AppealStatus }) => {
      return appealsService.updateAppealStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['appeals-stats'] });
      toast.success('Статус обновлён');
    },
    onError: () => toast.error('Ошибка при обновлении статуса'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await appealsService.deleteAppeal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      queryClient.invalidateQueries({ queryKey: ['appeals-stats'] });
      setDetailAppeal(null);
      setConfirmDeleteId(null);
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
    setConfirmDeleteId(id);
  };

  const pageBgClass = isDark ? 'bg-[#111113]' : 'bg-[#f5f5f7]';
  const cardClass = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]';
  const mutedTextClass = isDark ? 'text-white/60' : 'text-[#6e6e73]';
  const bodyTextClass = isDark ? 'text-white/92' : 'text-[#3a3a3c]';
  const fieldClass = getFormFieldClass(isDark, 'md');
  const selectTriggerClass = getFormSelectTriggerClass(isDark, 'md');
  const selectContentClass = getFormSelectContentClass(isDark);
  const selectItemClass = getFormSelectItemClass(isDark);

  if (isLoading && !data) {
    return (
      <DashboardLayout>
        <div className={`flex min-h-screen items-center justify-center ${pageBgClass}`}>
          <Loader2 className="h-8 w-8 animate-spin text-[#FEC004]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={`flex min-h-screen items-center justify-center ${pageBgClass} px-4`}>
          <div className={`w-full max-w-md rounded-[20px] border p-6 text-center font-myriad ${cardClass}`}>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400">Ошибка загрузки обращений</p>
            <p className={`mt-1 text-sm ${mutedTextClass}`}>Попробуйте обновить страницу или проверить подключение API.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`w-full min-h-screen px-4 py-6 font-myriad transition-colors ${pageBgClass}`}>
        <div className="w-full flex gap-4">

          {/* Основная таблица */}
          <div className={`flex-1 min-w-0 ${detailAppeal ? 'hidden sm:block' : ''}`}>

            {/* Фильтры */}
            <div className={`mb-4 rounded-[20px] border p-4 ${cardClass}`}>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Поиск по телефону, имени, описанию..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className={fieldClass}
                  />
                </div>
                <div className="w-[160px]">
                  <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      <SelectItem value="all" className={selectItemClass}>Все статусы</SelectItem>
                      {APPEAL_STATUS_FLOW.map((s) => (
                        <SelectItem key={s} value={s} className={selectItemClass}>{APPEAL_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleOpenCreate}
                  className={`h-10 rounded-2xl font-semibold ml-auto ${isDark ? 'bg-white text-[#111113] hover:bg-gray-100' : 'bg-[#FEC004] text-[#111113] hover:bg-[#e3ac00]'}`}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Обращение
                </Button>
              </div>
            </div>

            {/* Статистика */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {APPEAL_STATUS_FLOW.map((s) => {
                const count = statsData?.data?.byStatus?.[s] ?? 0;
                return (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        statusFilter === s
                          ? isDark ? 'bg-white/[0.08] border-white/30' : 'bg-[#ececf1] border-black/15'
                          : `${cardClass} hover:border-black/20 dark:hover:border-white/20`
                      }`}
                    >
                      <div className={`text-xl font-light ${bodyTextClass}`}>{count}</div>
                      <div className={`mt-0.5 text-xs font-light leading-tight ${mutedTextClass}`}>{APPEAL_STATUS_LABELS[s]}</div>
                    </button>
                  );
                })}
            </div>

            {/* Таблица */}
            <div className={`overflow-hidden rounded-[20px] border ${cardClass}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-white/[0.04] border-white/15' : 'bg-gray-50 border-gray-200'}`}>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>ID</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Статус</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Дата</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Источник</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Телефон</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Имя</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}>Примечание</th>
                      <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide ${mutedTextClass}`}></th>
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
                              ? isDark ? 'bg-white/[0.06]' : 'bg-black/[0.025]'
                              : isDark ? 'border-white/10 hover:bg-white/[0.04]' : 'border-gray-100 hover:bg-black/[0.015]'
                          }`}
                        >
                          <td className={`px-4 py-3 text-sm ${mutedTextClass}`}>{appeal.id}</td>
                          <td className="px-4 py-3">
                            <Select
                              value={appeal.status}
                              onValueChange={(v) => {
                                updateStatusMutation.mutate({ id: appeal.id, status: v as AppealStatus });
                              }}
                            >
                              <SelectTrigger
                                onClick={(e) => e.stopPropagation()}
                                className={`w-[160px] h-7 text-xs border ${APPEAL_STATUS_COLORS[appeal.status]} bg-transparent focus-visible:ring-0`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={selectContentClass}>
                                {APPEAL_STATUS_FLOW.map((s) => (
                                  <SelectItem key={s} value={s} className={selectItemClass}>
                                    {APPEAL_STATUS_LABELS[s]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className={`px-4 py-3 text-sm whitespace-nowrap ${mutedTextClass}`}>
                            {new Date(appeal.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs sm:text-sm">
                              {appeal.cityName && <span className={bodyTextClass}>{appeal.cityName}</span>}
                              {appeal.cityName && appeal.rkName && <span className="text-gray-400">•</span>}
                              {appeal.rkName && <span className={mutedTextClass}>{appeal.rkName}</span>}
                              {(appeal.cityName || appeal.rkName) && appeal.source && <span className="text-gray-400">•</span>}
                              {appeal.source && <span className="text-[#FEC004]">{appeal.source}</span>}
                              {!appeal.cityName && !appeal.rkName && !appeal.source && <span className={mutedTextClass}>—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-mono ${bodyTextClass}`}>
                              {appeal.phone}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${bodyTextClass}`}>
                            {appeal.clientName || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <p className={`max-w-[200px] truncate text-sm ${bodyTextClass}`}>
                              {appeal.description || '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(appeal)}
                                className={`h-7 w-7 p-0 ${mutedTextClass} hover:text-[#FEC004]`}
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
                        <td colSpan={8} className="py-16 text-center">
                          <MessageSquare className={`h-10 w-10 mx-auto mb-3 ${mutedTextClass}`} />
                          <p className={`text-sm ${mutedTextClass}`}>Обращений не найдено</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className={`text-sm ${mutedTextClass}`}>
                    Показано {data.data.length} из {data.pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={`${isDark ? 'border-white/20 text-white/85 hover:bg-white/[0.06]' : 'border-gray-200 text-gray-700 hover:bg-black/[0.03]'} rounded-xl`}
                    >
                      Назад
                    </Button>
                    <span className={`px-3 py-1 text-sm ${mutedTextClass}`}>
                      {page} / {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                      className={`${isDark ? 'border-white/20 text-white/85 hover:bg-white/[0.06]' : 'border-gray-200 text-gray-700 hover:bg-black/[0.03]'} rounded-xl`}
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
            <div className={`w-full sm:w-[360px] shrink-0 self-start sticky top-4 overflow-hidden rounded-[20px] border ${cardClass}`}>
              {/* Шапка */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-semibold ${bodyTextClass}`}>
                  Обращение #{detailAppeal.id}
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(detailAppeal)}
                    className={`h-8 w-8 p-0 ${mutedTextClass} hover:text-[#FEC004]`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailAppeal(null)}
                    className={`h-8 w-8 p-0 ${mutedTextClass} hover:text-[#111113] dark:hover:text-white`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Клиент */}
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${mutedTextClass}`}>Клиент</p>
                  <div className="flex items-center gap-2">
                    <Phone className={`h-4 w-4 shrink-0 ${mutedTextClass}`} />
                    <span className={`font-mono text-sm ${bodyTextClass}`}>{detailAppeal.phone}</span>
                  </div>
                  {detailAppeal.clientName && (
                    <p className={`mt-1 ml-6 text-sm ${mutedTextClass}`}>{detailAppeal.clientName}</p>
                  )}
                </div>

                {/* Статус */}
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${APPEAL_STATUS_COLORS[detailAppeal.status]}`}>
                    {APPEAL_STATUS_LABELS[detailAppeal.status]}
                  </span>
                </div>

                {/* Источник */}
                {(detailAppeal.cityName || detailAppeal.rkName || detailAppeal.source) && (
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${mutedTextClass}`}>Источник</p>
                    <div className="flex items-center gap-1.5 text-sm">
                      {detailAppeal.cityName && <span className={bodyTextClass}>{detailAppeal.cityName}</span>}
                      {detailAppeal.cityName && detailAppeal.rkName && <span className="text-gray-400">•</span>}
                      {detailAppeal.rkName && <span className={mutedTextClass}>{detailAppeal.rkName}</span>}
                      {(detailAppeal.cityName || detailAppeal.rkName) && detailAppeal.source && <span className="text-gray-400">•</span>}
                      {detailAppeal.source && <span className="text-[#FEC004]">{detailAppeal.source}</span>}
                    </div>
                  </div>
                )}

                {/* Примечание */}
                {detailAppeal.description && (
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${mutedTextClass}`}>Примечание</p>
                    <p className={`text-sm leading-relaxed ${bodyTextClass}`}>{detailAppeal.description}</p>
                  </div>
                )}

                {/* Привязки */}
                <div className="space-y-1.5">
                  {detailAppeal.callId && (
                    <p className={`text-xs ${mutedTextClass}`}>Звонок: <span className={bodyTextClass}>#{detailAppeal.callId}</span></p>
                  )}
                  {detailAppeal.siteOrderId && (
                    <p className={`text-xs ${mutedTextClass}`}>Заявка с сайта: <span className={bodyTextClass}>#{detailAppeal.siteOrderId}</span></p>
                  )}
                  {detailAppeal.operator && (
                    <p className={`text-xs ${mutedTextClass}`}>Оператор: <span className={bodyTextClass}>{detailAppeal.operator.name}</span></p>
                  )}
                </div>

                {/* Дата */}
                <p className={`text-xs ${mutedTextClass}`}>
                  {new Date(detailAppeal.createdAt).toLocaleString('ru-RU')}
                </p>

                {/* Кнопки смены статуса */}
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${mutedTextClass}`}>Изменить статус</p>
                  <div className="flex flex-col gap-1.5">
                    {APPEAL_STATUS_FLOW.filter((s) => s !== detailAppeal.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          updateStatusMutation.mutate({ id: detailAppeal.id, status: s });
                          setDetailAppeal({ ...detailAppeal, status: s });
                        }}
                        className={`text-left text-xs px-3 py-2 rounded-xl border transition-colors ${APPEAL_STATUS_COLORS[s]} opacity-80 hover:opacity-100`}
                      >
                        → {APPEAL_STATUS_LABELS[s]}
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
          queryClient.invalidateQueries({ queryKey: ['appeals-stats'] });
          setIsModalOpen(false);
          setEditingAppeal(null);
        }}
      />

      {/* Confirm Delete Dialog */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-sm rounded-[24px] p-6 shadow-2xl ${cardClass}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Удалить обращение?</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Это действие необратимо.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
                className={isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              >
                Отмена
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
