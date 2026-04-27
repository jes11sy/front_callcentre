'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { useDesignStore } from '@/store/designStore';
import React from 'react';

export interface Penalty {
  id: number;
  cityId: number;
  city: string;
  note: string; // Причина
  amount: number;
  createdAt: string;
  nameCreate?: string; // Имя создателя
}

interface PenaltiesTableProps {
  penalties: Penalty[];
  isLoading: boolean;
  onEditPenalty: (penalty: Penalty) => void;
  onDeletePenalty: (id: number) => void;
  onCreatePenalty: () => void;
}

export const PenaltiesTable = ({
  penalties,
  isLoading,
  onEditPenalty,
  onDeletePenalty,
  onCreatePenalty,
}: PenaltiesTableProps) => {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cardClass = `rounded-[20px] border font-myriad ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/[0.08]'}`;
  const createBtnClass = isDark ? 'bg-white text-[#111113] hover:bg-gray-100' : 'bg-[#FEC004] text-[#111113] hover:bg-[#e3ac00]';

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pt-2">
            <Button onClick={onCreatePenalty} className={`${createBtnClass} ml-auto`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать</span>
              <span className="sm:hidden">Новый</span>
            </Button>
          </div>
          <LoadingState isDark={isDark} message="Загрузка штрафов..." />
        </CardContent>
      </Card>
    );
  }

  if (penalties?.length === 0) {
    return (
      <Card className={cardClass}>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pt-2">
            <Button onClick={onCreatePenalty} className={`${createBtnClass} ml-auto`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать</span>
              <span className="sm:hidden">Новый</span>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 mb-4 text-gray-400" />
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Нет штрафов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pt-2">
          <Button onClick={onCreatePenalty} className={`${createBtnClass} ml-auto`}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Создать</span>
            <span className="sm:hidden">Новый</span>
          </Button>
        </div>

        {/* Мобильный вид - карточки */}
        <div className="sm:hidden space-y-3">
          {penalties.map((penalty) => (
            <div 
              key={penalty.id}
              className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {penalty.city}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(penalty.createdAt)}
                  </div>
                </div>
                <div className="text-base font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(penalty.amount)}
                </div>
              </div>
              
              <div className="text-sm mb-3 text-gray-700 dark:text-gray-300">
                {penalty.note}
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPenalty(penalty)}
                  className={isDark ? 'h-8 px-3 text-white hover:bg-white/10' : 'h-8 px-3 text-[#b58500] hover:bg-[#FEC004]/15'}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="text-xs">Изменить</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Удалить штраф "${penalty.note}"?`)) {
                      onDeletePenalty(penalty.id);
                    }
                  }}
                  className="h-8 px-3 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Удалить</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Десктопный вид - таблица */}
        <div className={`hidden sm:block rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Table>
            <TableHeader>
              <TableRow className={`border-b-2 ${isDark ? 'bg-white/[0.04] border-white/20 hover:bg-white/[0.04]' : 'bg-gray-50 border-gray-200 hover:bg-gray-50'}`}>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Город</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Причина</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Сумма</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Дата</TableHead>
                <TableHead className="font-semibold text-right text-gray-600 dark:text-gray-300">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow 
                  key={penalty.id}
                  className={`border-b ${isDark ? 'border-white/10 hover:bg-white/[0.04]' : 'border-gray-100 hover:bg-black/[0.02]'}`}
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {penalty.city}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {penalty.note}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(penalty.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(penalty.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPenalty(penalty)}
                        className={isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-[#b58500] hover:bg-[#FEC004]/15 hover:text-[#b58500]'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Удалить штраф "${penalty.note}"?`)) {
                            onDeletePenalty(penalty.id);
                          }
                        }}
                        className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

