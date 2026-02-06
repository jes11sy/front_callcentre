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
    ? "bg-white border border-gray-200 font-myriad"
    : "bg-[#17212b] border-2 border-[#FFD700]/30";

  // Стили для заголовка
  const titleClass = isV2 ? 'text-gray-900' : 'text-white';
  const iconClass = isV2 ? 'text-[#FEC004]' : 'text-[#FFD700]';
  
  // Стили для кнопки создания
  const createBtnClass = isV2 
    ? "bg-[#FEC004] text-gray-900 hover:bg-[#e6ac00]"
    : "bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90";

  if (isLoading) {
    return (
      <Card className={cardClass}>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-6 w-6 ${iconClass}`} />
              <h2 className={`text-2xl font-bold ${titleClass}`}>Штрафы</h2>
            </div>
            <Button onClick={onCreatePenalty} className={createBtnClass}>
              <Plus className="mr-2 h-4 w-4" />
              Создать
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
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-6 w-6 ${iconClass}`} />
              <h2 className={`text-2xl font-bold ${titleClass}`}>Штрафы</h2>
            </div>
            <Button onClick={onCreatePenalty} className={createBtnClass}>
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className={`h-12 w-12 mb-4 ${isV2 ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-lg ${isV2 ? 'text-gray-600' : 'text-white'}`}>Нет штрафов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardContent className="px-6 pb-6">
        <div className="flex items-center justify-between mb-6 pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-6 w-6 ${iconClass}`} />
            <h2 className={`text-2xl font-bold ${titleClass}`}>Штрафы</h2>
          </div>
          <Button onClick={onCreatePenalty} className={createBtnClass}>
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>

        <div className={`rounded-md border overflow-hidden ${isV2 ? 'border-gray-200' : 'border-[#FFD700]/20'}`}>
          <Table>
            <TableHeader>
              <TableRow className={isV2 
                ? "bg-gray-50 hover:bg-gray-50 border-b border-gray-200"
                : "bg-[#0f0f23] hover:bg-[#0f0f23] border-b border-[#FFD700]/20"
              }>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600' : 'text-[#FFD700]'}`}>Город</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600' : 'text-[#FFD700]'}`}>Причина</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600' : 'text-[#FFD700]'}`}>Сумма</TableHead>
                <TableHead className={`font-semibold ${isV2 ? 'text-gray-600' : 'text-[#FFD700]'}`}>Дата</TableHead>
                <TableHead className={`font-semibold text-right ${isV2 ? 'text-gray-600' : 'text-[#FFD700]'}`}>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow 
                  key={penalty.id}
                  className={isV2 
                    ? "border-b border-gray-100 hover:bg-gray-50"
                    : "border-b border-[#FFD700]/10 hover:bg-[#FFD700]/5"
                  }
                >
                  <TableCell className={`font-medium ${isV2 ? 'text-gray-900' : 'text-white'}`}>
                    {penalty.city}
                  </TableCell>
                  <TableCell className={isV2 ? 'text-gray-700' : 'text-gray-300'}>
                    {penalty.note}
                  </TableCell>
                  <TableCell className={`font-semibold ${isV2 ? 'text-red-600' : 'text-red-400'}`}>
                    {formatCurrency(penalty.amount)}
                  </TableCell>
                  <TableCell className={`text-sm ${isV2 ? 'text-gray-500' : 'text-gray-400'}`}>
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

