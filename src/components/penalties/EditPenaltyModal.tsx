'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Penalty } from './PenaltiesTable';
import { useDesignStore } from '@/store/designStore';

interface EditPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  penalty: Penalty | null;
  onSave: (id: number, data: { city: string; reason: string; amount: number; orderNumber?: string }) => Promise<void>;
  cities: string[]; // Список городов из заказов
}

const PENALTY_REASONS = [
  'Отмена из-за переноса',
  'Неактуальный статус заказов',
];

export const EditPenaltyModal = ({ isOpen, onClose, penalty, onSave, cities }: EditPenaltyModalProps) => {
  const { theme } = useDesignStore();
  const isDark = theme === 'dark';
  
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ city?: string; reason?: string; amount?: string; orderNumber?: string }>({});

  useEffect(() => {
    if (penalty) {
      setCity(penalty.city);
      setAmount(penalty.amount.toString());
      
      // Парсим note чтобы извлечь reason и orderNumber
      // Формат: "Отмена из-за переноса заказ 12345" или "Неактуальный статус заказов"
      const noteText = penalty.note || '';
      
      if (noteText.includes('заказ')) {
        // Есть номер заказа
        const parts = noteText.split(' заказ ');
        setReason(parts[0]);
        setOrderNumber(parts[1] || '');
      } else {
        // Нет номера заказа
        setReason(noteText);
        setOrderNumber('');
      }
    }
  }, [penalty]);

  const handleSave = async () => {
    if (!penalty) return;

    // Валидация
    const newErrors: { city?: string; reason?: string; amount?: string; orderNumber?: string } = {};
    
    if (!city) {
      newErrors.city = 'Выберите город';
    }
    
    if (!reason) {
      newErrors.reason = 'Выберите причину';
    }
    
    // Если выбрана "Отмена из-за переноса", требуем номер заказа
    if (reason === 'Отмена из-за переноса' && !orderNumber.trim()) {
      newErrors.orderNumber = 'Укажите номер заказа';
    }
    
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Укажите корректную сумму';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(penalty.id, {
        city,
        reason,
        amount: amountNum,
        orderNumber: reason === 'Отмена из-за переноса' ? orderNumber.trim() : undefined,
      });
      
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error updating penalty:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setErrors({});
      onClose();
    }
  };

  if (!penalty) return null;

  // Стили
  const dialogClass = "bg-[#f5f5f7] dark:bg-[#111113] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 w-[calc(100%-2rem)] sm:max-w-md font-myriad rounded-[20px]";
  
  const selectTriggerClass = "outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 bg-white border-gray-200 text-gray-900 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:bg-white/[0.04] dark:border-white/15 dark:text-white dark:[&_[data-placeholder]]:text-white/45 dark:[&_svg]:text-white/70";
  
  const selectContentClass = "bg-white border-gray-200 dark:bg-[#1e1e20] dark:border-white/10";
  
  const selectItemClass = "text-gray-700 data-[highlighted]:bg-black/5 dark:text-white dark:data-[highlighted]:bg-white/10";
  
  const inputClass = "outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 dark:bg-white/[0.04] dark:border-white/15 dark:text-white dark:placeholder:text-white/45";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Редактировать штраф
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Город */}
          <div className="space-y-2">
            <Label htmlFor="edit-city" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Город *
            </Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="edit-city" className={`h-11 ${selectTriggerClass}`}>
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                {cities.length > 0 ? (
                  cities.map((cityName) => (
                    <SelectItem key={cityName} value={cityName} className={selectItemClass}>
                      {cityName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled className="text-gray-500">
                    Загрузка городов...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.city && (
              <p className="text-sm text-red-400">{errors.city}</p>
            )}
          </div>

          {/* Причина */}
          <div className="space-y-2">
            <Label htmlFor="edit-reason" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Причина *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="edit-reason" className={`h-11 ${selectTriggerClass}`}>
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                {PENALTY_REASONS.map((reasonText) => (
                  <SelectItem key={reasonText} value={reasonText} className={selectItemClass}>
                    {reasonText}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-400">{errors.reason}</p>
            )}
          </div>

          {/* Номер заказа (условное поле) */}
          {reason === 'Отмена из-за переноса' && (
            <div className="space-y-2">
              <Label htmlFor="edit-orderNumber" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Номер заказа *
              </Label>
              <Input
                id="edit-orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Введите номер заказа"
                className={`h-11 ${inputClass}`}
              />
              {errors.orderNumber && (
                <p className="text-sm text-red-400">{errors.orderNumber}</p>
              )}
            </div>
          )}

          {/* Сумма */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Сумма *
            </Label>
            <Input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`h-11 ${inputClass}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-400">{errors.amount}</p>
            )}
          </div>
        </div>

        {/* Кнопки - на мобильном в колонку */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="h-11 border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={isDark ? 'h-11 bg-white text-[#111113] hover:bg-gray-100' : 'h-11 bg-[#FEC004] text-[#111113] hover:bg-[#e3ac00]'}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

