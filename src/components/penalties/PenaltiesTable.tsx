'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
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

  if (isLoading) {
    return (
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-[#FFD700]" />
              <h2 className="text-2xl font-bold text-white">Штрафы</h2>
            </div>
            <Button 
              onClick={onCreatePenalty}
              className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90"
            >
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
      <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6 pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-[#FFD700]" />
              <h2 className="text-2xl font-bold text-white">Штрафы</h2>
            </div>
            <Button 
              onClick={onCreatePenalty}
              className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-lg text-white">Нет штрафов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#17212b] border-2 border-[#FFD700]/30">
      <CardContent className="px-6 pb-6">
        <div className="flex items-center justify-between mb-6 pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#FFD700]" />
            <h2 className="text-2xl font-bold text-white">Штрафы</h2>
          </div>
            <Button 
              onClick={onCreatePenalty}
              className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать
            </Button>
        </div>

        <div className="rounded-md border border-[#FFD700]/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0f0f23] hover:bg-[#0f0f23] border-b border-[#FFD700]/20">
                <TableHead className="text-[#FFD700] font-semibold">Город</TableHead>
                <TableHead className="text-[#FFD700] font-semibold">Причина</TableHead>
                <TableHead className="text-[#FFD700] font-semibold">Сумма</TableHead>
                <TableHead className="text-[#FFD700] font-semibold">Дата</TableHead>
                <TableHead className="text-[#FFD700] font-semibold text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow 
                  key={penalty.id}
                  className="border-b border-[#FFD700]/10 hover:bg-[#FFD700]/5"
                >
                  <TableCell className="text-white font-medium">
                    {penalty.city}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {penalty.note}
                  </TableCell>
                  <TableCell className="text-red-400 font-semibold">
                    {formatCurrency(penalty.amount)}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {formatDate(penalty.dateCreate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPenalty(penalty)}
                        className="text-[#FFD700] hover:bg-[#FFD700]/10 hover:text-[#FFD700]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Удалить штраф "${penalty.reason}"?`)) {
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

