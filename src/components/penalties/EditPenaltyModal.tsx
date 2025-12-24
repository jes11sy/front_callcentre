'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Penalty } from './PenaltiesTable';

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#17212b] border-2 border-[#FFD700]/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FFD700]">
            Редактировать штраф
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Город */}
          <div className="space-y-2">
            <Label htmlFor="edit-city" className="text-sm font-medium text-gray-300">
              Город *
            </Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger 
                id="edit-city"
                className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&_span]:!text-white [&_span[data-placeholder]]:!text-gray-500"
              >
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                {cities.length > 0 ? (
                  cities.map((cityName) => (
                    <SelectItem 
                      key={cityName} 
                      value={cityName}
                      className="text-white hover:bg-[#FFD700]/10 focus:bg-[#FFD700]/20 focus:text-white data-[state=checked]:text-white data-[highlighted]:text-white data-[highlighted]:bg-[#FFD700]/10"
                    >
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
            <Label htmlFor="edit-reason" className="text-sm font-medium text-gray-300">
              Причина *
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger 
                id="edit-reason"
                className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20 [&_span]:!text-white [&_span[data-placeholder]]:!text-gray-500"
              >
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                {PENALTY_REASONS.map((reasonText) => (
                  <SelectItem 
                    key={reasonText} 
                    value={reasonText}
                    className="text-white hover:bg-[#FFD700]/10 focus:bg-[#FFD700]/20 focus:text-white data-[state=checked]:text-white data-[highlighted]:text-white data-[highlighted]:bg-[#FFD700]/10"
                  >
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
              <Label htmlFor="edit-orderNumber" className="text-sm font-medium text-gray-300">
                Номер заказа *
              </Label>
              <Input
                id="edit-orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Введите номер заказа"
                className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
              />
              {errors.orderNumber && (
                <p className="text-sm text-red-400">{errors.orderNumber}</p>
              )}
            </div>
          )}

          {/* Сумма */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-300">
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
              className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
            />
            {errors.amount && (
              <p className="text-sm text-red-400">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="border-[#FFD700]/30 text-gray-300 hover:bg-[#FFD700]/10"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#FFD700] text-[#02111B] hover:bg-[#FFD700]/90"
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

