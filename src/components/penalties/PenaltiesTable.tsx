'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import { useDesignStore } from '@/store/designStore';
import React from 'react';

export interface Penalty {
  id: number;
  city: string;
  note: string; // Причина
  amount: number;
  dateCreate: string;
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
  const { version } = useDesignStore();
  const isV2 = version === 'v2';

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

  // Общие стили для карточки
  const cardClass = isV2 
    ? "bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-gray-700 font-myriad"
    : "bg-[#17212b] border-2 border-[#FFD700]/30";

  // Стили для заголовка
  const titleClass = isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white';
  const iconClass = isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]';
  
  // Стили для кнопки создания
  const createBtnClass = isV2 
    ? "bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
    : "bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90";

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className={`flex items-center justify-between mb-4 sm:mb-6 ${isV2 ? 'pt-2' : 'pt-4 sm:pt-6'}`}>
            {!isV2 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${iconClass}`} />
                <h2 className={`text-lg sm:text-2xl font-bold ${titleClass}`}>Штрафы</h2>
              </div>
            )}
            <Button onClick={onCreatePenalty} className={`${createBtnClass} ${isV2 ? 'ml-auto' : ''}`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать</span>
              <span className="sm:hidden">Новый</span>
            </Button>
          </div>
          <LoadingState 
            message="Загрузка штрафов..." 
            size="lg"
            className="py-12"
          />
        </CardContent>
      </Card>
    );
  }

  if (penalties?.length === 0) {
    return (
      <Card className={cardClass}>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className={`flex items-center justify-between mb-4 sm:mb-6 ${isV2 ? 'pt-2' : 'pt-4 sm:pt-6'}`}>
            {!isV2 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${iconClass}`} />
                <h2 className={`text-lg sm:text-2xl font-bold ${titleClass}`}>Штрафы</h2>
              </div>
            )}
            <Button onClick={onCreatePenalty} className={`${createBtnClass} ${isV2 ? 'ml-auto' : ''}`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Создать</span>
              <span className="sm:hidden">Новый</span>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className={`h-10 w-10 sm:h-12 sm:w-12 mb-4 ${isV2 ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-base sm:text-lg ${isV2 ? 'text-gray-600' : 'text-white'}`}>Нет штрафов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Header */}
        <div className={`flex items-center justify-between mb-4 sm:mb-6 ${isV2 ? 'pt-2' : 'pt-4 sm:pt-6'}`}>
          {!isV2 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${iconClass}`} />
              <h2 className={`text-lg sm:text-2xl font-bold ${titleClass}`}>Штрафы</h2>
            </div>
          )}
          <Button onClick={onCreatePenalty} className={`${createBtnClass} ${isV2 ? 'ml-auto' : ''}`}>
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
              className={`p-3 rounded-lg ${isV2 
                ? 'bg-gray-50 dark:bg-[#252d3a] border border-gray-200 dark:border-gray-700' 
                : 'bg-[#0f0f23] border border-[#FFD700]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className={`text-sm font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>
                    {penalty.city}
                  </div>
                  <div className={`text-xs ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>
                    {formatDate(penalty.dateCreate)}
                  </div>
                </div>
                <div className={`text-base font-bold ${isV2 ? 'text-red-600 dark:text-red-400' : 'text-red-400'}`}>
                  {formatCurrency(penalty.amount)}
                </div>
              </div>
              
              <div className={`text-sm mb-3 ${isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300'}`}>
                {penalty.note}
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPenalty(penalty)}
                  className={`h-8 px-3 ${isV2 
                    ? "text-[#FEC004] hover:bg-[#FEC004]/10"
                    : "text-[#FFD700] hover:bg-[#FFD700]/10"
                  }`}
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
        <div className={`hidden sm:block rounded-md border overflow-hidden ${isV2 ? 'border-gray-200 dark:border-gray-700' : 'border-[#FFD700]/20'}`}>
          <Table>
            <TableHeader>
              <TableRow className={isV2 
                ? "bg-gray-50 dark:bg-[#252d3a] hover:bg-gray-50 dark:hover:bg-[#252d3a] border-b border-gray-200 dark:border-gray-700"
                : "bg-[#0f0f23] hover:bg-[#0f0f23] border-b border-[#FFD700]/20"
              }>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600 dark:text-gray-300' : 'text-[#FFD700]'}`}>Город</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600 dark:text-gray-300' : 'text-[#FFD700]'}`}>Причина</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600 dark:text-gray-300' : 'text-[#FFD700]'}`}>Сумма</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600 dark:text-gray-300' : 'text-[#FFD700]'}`}>Дата</TableHead>
                <TableHead className={`font-semibold text-right ${isV2 ? 'text-gray-600 dark:text-gray-300' : 'text-[#FFD700]'}`}>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow 
                  key={penalty.id}
                  className={isV2 
                    ? "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#252d3a]"
                    : "border-b border-[#FFD700]/10 hover:bg-[#FFD700]/5"
                  }
                >
                  <TableCell className={`font-medium ${isV2 ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>
                    {penalty.city}
                  </TableCell>
                  <TableCell className={isV2 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300'}>
                    {penalty.note}
                  </TableCell>
                  <TableCell className={`font-semibold ${isV2 ? 'text-red-600 dark:text-red-400' : 'text-red-400'}`}>
                    {formatCurrency(penalty.amount)}
                  </TableCell>
                  <TableCell className={`text-sm ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>
                    {formatDate(penalty.dateCreate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPenalty(penalty)}
                        className={isV2 
                          ? "text-[#FEC004] hover:bg-[#FEC004]/10 hover:text-[#FEC004]"
                          : "text-[#FFD700] hover:bg-[#FFD700]/10 hover:text-[#FFD700]"
                        }
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

