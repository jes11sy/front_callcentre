'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { X, Save } from 'lucide-react';
import { Order } from '@/types/orders';
import { ORDER_TYPES, EQUIPMENT_TYPES, STATUS_OPTIONS, STATUS_COLORS, STATUS_LABELS, CITIES } from '@/constants/orders';
import api from '@/lib/api';

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  userRole?: string;
  onSave: () => void;
  isSaving: boolean;
  onOrderChange: (order: Order) => void;
}

export const OrderEditModal = ({ 
  isOpen, 
  onClose, 
  order, 
  userRole, 
  onSave, 
  isSaving, 
  onOrderChange 
}: OrderEditModalProps) => {
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/phones/sources').then(res => {
        if (res.data.success && res.data.data) {
          setSources(res.data.data);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleOrderChange = (field: keyof Order, value: unknown) => {
    onOrderChange({ ...order, [field]: value });
  };

  const handleDateChange = (field: 'dateMeeting', value: string) => {
    if (value) {
      const localDate = new Date(value);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      handleOrderChange(field, utcDate.toISOString());
    } else {
      handleOrderChange(field, '');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.2)] w-full max-w-2xl max-h-[85vh] overflow-hidden border-2 border-[#FFD700]/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#FFD700]/30 bg-[#17212b]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#FFD700]">
              Редактирование #{order.id}
            </h2>
            <Badge 
              className={`text-xs ${STATUS_COLORS[order.statusOrder as keyof typeof STATUS_COLORS] || 'bg-gray-800 text-gray-300'}`}
            >
              {STATUS_LABELS[order.statusOrder as keyof typeof STATUS_LABELS] || order.statusOrder}
            </Badge>
            <Badge variant="outline" className="text-xs border-[#FFD700]/30 text-[#FFD700]">
              {order.typeEquipment}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {/* Две колонки */}
          <div className="grid grid-cols-2 gap-6">
            {/* Левая колонка — Информация по заказу */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#FFD700] pb-2 border-b border-[#FFD700]/20">Информация по заказу</h3>
              
              <Row label="Тип заявки">
                <Select value={order.typeOrder} onValueChange={(v) => handleOrderChange('typeOrder', v)}>
                  <SelectTrigger className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {ORDER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#FFD700]/10">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="Тип техники">
                <Select value={order.typeEquipment} onValueChange={(v) => handleOrderChange('typeEquipment', v)}>
                  <SelectTrigger className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {EQUIPMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-[#FFD700]/10">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="РК">
                <Input 
                  value={order.rk} 
                  onChange={(e) => handleOrderChange('rk', e.target.value)}
                  className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white"
                />
              </Row>

              <Row label="Источник">
                <Select value={order.avitoName || ''} onValueChange={(v) => handleOrderChange('avitoName', v)}>
                  <SelectTrigger className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white w-full">
                    <span className="truncate">{order.avitoName || 'Выберите'}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {sources.map((s) => (
                      <SelectItem key={s} value={s} className="text-white hover:bg-[#FFD700]/10">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="Город">
                <Select value={order.city} onValueChange={(v) => handleOrderChange('city', v)}>
                  <SelectTrigger className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-white hover:bg-[#FFD700]/10">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </div>

            {/* Правая колонка — Контакты и время */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#FFD700] pb-2 border-b border-[#FFD700]/20">Контакты и время</h3>
              
              <Row label="Клиент">
                <Input 
                  value={order.clientName} 
                  onChange={(e) => handleOrderChange('clientName', e.target.value)}
                  className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white"
                />
              </Row>

              <Row label="Телефон">
                <Input 
                  value={order.phone || ''} 
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.startsWith('8')) {
                      value = '7' + value.slice(1);
                    }
                    if (!value.startsWith('7') && value.length > 0) {
                      value = '7' + value;
                    }
                    if (value.length > 11) {
                      value = value.slice(0, 11);
                    }
                    handleOrderChange('phone', value);
                  }}
                  maxLength={11}
                  className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white placeholder:text-gray-500"
                  placeholder="79991234567"
                />
              </Row>

              <Row label="Дата">
                <Input 
                  type="datetime-local"
                  value={order.dateMeeting ? new Date(order.dateMeeting).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => handleDateChange('dateMeeting', e.target.value)}
                  className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white [color-scheme:dark]"
                />
              </Row>

              <Row label="Статус">
                <Select value={order.statusOrder} onValueChange={(v) => handleOrderChange('statusOrder', v)}>
                  <SelectTrigger className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                    {STATUS_OPTIONS.filter(o => o.value !== 'all').map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-white hover:bg-[#FFD700]/10">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </div>
          </div>

          {/* Нижняя часть — на всю ширину */}
          <div className="mt-5 pt-5 border-t border-[#FFD700]/20 space-y-3">
            <Row label="Адрес">
              <Input 
                value={order.address} 
                onChange={(e) => handleOrderChange('address', e.target.value)}
                className="h-9 bg-[#17212b] border-[#FFD700]/20 text-white"
              />
            </Row>

            <Row label="Проблема">
              <Textarea 
                value={order.problem} 
                onChange={(e) => handleOrderChange('problem', e.target.value)}
                className="min-h-[80px] bg-[#17212b] border-[#FFD700]/20 text-white resize-none"
              />
            </Row>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-[#FFD700]/30 bg-[#17212b]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Отмена
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0f0f23] font-medium"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// === Вспомогательные компоненты ===

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <Label className="text-sm text-gray-400 shrink-0 w-24">{label}</Label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);
