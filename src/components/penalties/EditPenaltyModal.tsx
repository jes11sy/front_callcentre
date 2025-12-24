'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Penalty } from './PenaltiesTable';

interface EditPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  penalty: Penalty | null;
  onSave: (id: number, data: { city: string; reason: string; amount: number }) => Promise<void>;
}

const CITIES = [
  'Казань',
  'Самара',
  'Уфа',
  'Пенза',
  'Ульяновск',
  'Чебоксары',
  'Йошкар-Ола',
  'Саранск',
  'Оренбург',
  'Ижевск',
];

export const EditPenaltyModal = ({ isOpen, onClose, penalty, onSave }: EditPenaltyModalProps) => {
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ city?: string; reason?: string; amount?: string }>({});

  useEffect(() => {
    if (penalty) {
      setCity(penalty.city);
      setReason(penalty.reason);
      setAmount(penalty.amount.toString());
    }
  }, [penalty]);

  const handleSave = async () => {
    if (!penalty) return;

    // Валидация
    const newErrors: { city?: string; reason?: string; amount?: string } = {};
    
    if (!city) {
      newErrors.city = 'Выберите город';
    }
    
    if (!reason.trim()) {
      newErrors.reason = 'Укажите причину';
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
        reason: reason.trim(),
        amount: amountNum,
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
                className="bg-[#0f0f23] border-[#FFD700]/30 text-white focus:border-[#FFD700] focus:ring-[#FFD700]/20"
              >
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                {CITIES.map((cityName) => (
                  <SelectItem 
                    key={cityName} 
                    value={cityName}
                    className="text-white hover:bg-[#FFD700]/10 focus:bg-[#FFD700]/20"
                  >
                    {cityName}
                  </SelectItem>
                ))}
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
            <Textarea
              id="edit-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишите причину штрафа"
              className="bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700]/20 min-h-[100px]"
            />
            {errors.reason && (
              <p className="text-sm text-red-400">{errors.reason}</p>
            )}
          </div>

          {/* Сумма */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-300">
              Сумма (₽) *
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

