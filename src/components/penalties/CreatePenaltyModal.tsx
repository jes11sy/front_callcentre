'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreatePenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { city: string; reason: string; amount: number }) => Promise<void>;
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

export const CreatePenaltyModal = ({ isOpen, onClose, onSave }: CreatePenaltyModalProps) => {
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ city?: string; reason?: string; amount?: string }>({});

  const handleSave = async () => {
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
      await onSave({
        city,
        reason: reason.trim(),
        amount: amountNum,
      });
      
      // Очистка формы
      setCity('');
      setReason('');
      setAmount('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating penalty:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setCity('');
      setReason('');
      setAmount('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#17212b] border-2 border-[#FFD700]/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#FFD700]">
            Создать штраф
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Город */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-300">
              Город *
            </Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger 
                id="city"
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
            <Label htmlFor="reason" className="text-sm font-medium text-gray-300">
              Причина *
            </Label>
            <Textarea
              id="reason"
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
            <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
              Сумма (₽) *
            </Label>
            <Input
              id="amount"
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
              'Создать'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

