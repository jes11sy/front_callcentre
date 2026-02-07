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
import { useDesignStore } from '@/store/designStore';

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
  const { version } = useDesignStore();
  const isV2 = version === 'v2';

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

  // Стили для V2
  const selectTriggerClass = isV2 
    ? "h-9 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-[#FEC004]"
    : "h-9 bg-[#17212b] border-[#FFD700]/20 text-white";
  
  const selectContentClass = isV2 
    ? "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600"
    : "bg-[#17212b] border-[#FFD700]/30";
  
  const selectItemClass = isV2 
    ? "text-gray-700 dark:text-gray-200 hover:bg-[#FEC004]/10"
    : "text-white hover:bg-[#FFD700]/10";
  
  const inputClass = isV2 
    ? "h-9 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-[#FEC004] focus-visible:border-[#FEC004]"
    : "h-9 bg-[#17212b] border-[#FFD700]/20 text-white";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className={isV2 
          ? "bg-[#F3F3EE] dark:bg-[#1e2530] rounded-lg shadow-xl dark:shadow-none w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col font-myriad"
          : "bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.2)] w-full max-w-2xl max-h-[85vh] overflow-hidden border-2 border-[#FFD700]/50 flex flex-col"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={isV2 
          ? "flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]"
          : "flex items-center justify-between px-5 py-3 border-b border-[#FFD700]/30 bg-[#17212b]"
        }>
          <h2 className={isV2 ? "text-lg font-bold text-gray-900 dark:text-gray-100" : "text-lg font-bold text-[#FFD700]"}>
            Редактирование #{order.id}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={isV2 
              ? "h-8 w-8 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              : "h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
            }
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
              <h3 className={`text-sm font-medium pb-2 border-b ${isV2 ? 'text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700' : 'text-[#FFD700] border-[#FFD700]/20'}`}>Информация по заказу</h3>
              
              <Row label="Тип заявки" isV2={isV2}>
                <Select value={order.typeOrder} onValueChange={(v) => handleOrderChange('typeOrder', v)}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {ORDER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className={selectItemClass}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="Тип техники" isV2={isV2}>
                <Select value={order.typeEquipment} onValueChange={(v) => handleOrderChange('typeEquipment', v)}>
                  <SelectTrigger className={`${selectTriggerClass} w-full`}>
                    <span className="truncate">{EQUIPMENT_TYPES.find(t => t.value === order.typeEquipment)?.label || order.typeEquipment}</span>
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {EQUIPMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className={selectItemClass}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="РК" isV2={isV2}>
                <Input 
                  value={order.rk} 
                  onChange={(e) => handleOrderChange('rk', e.target.value)}
                  className={inputClass}
                />
              </Row>

              <Row label="Источник" isV2={isV2}>
                <Select value={order.avitoName || ''} onValueChange={(v) => handleOrderChange('avitoName', v)}>
                  <SelectTrigger className={`${selectTriggerClass} w-full`}>
                    <span className="truncate">{order.avitoName || 'Выберите'}</span>
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {sources.map((s) => (
                      <SelectItem key={s} value={s} className={selectItemClass}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="Город" isV2={isV2}>
                <Select value={order.city} onValueChange={(v) => handleOrderChange('city', v)}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className={selectItemClass}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </div>

            {/* Правая колонка — Контакты и время */}
            <div className="space-y-3">
              <h3 className={`text-sm font-medium pb-2 border-b ${isV2 ? 'text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700' : 'text-[#FFD700] border-[#FFD700]/20'}`}>Контакты и время</h3>
              
              <Row label="Клиент" isV2={isV2}>
                <Input 
                  value={order.clientName} 
                  onChange={(e) => handleOrderChange('clientName', e.target.value)}
                  className={inputClass}
                />
              </Row>

              <Row label="Телефон" isV2={isV2}>
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
                  className={`${inputClass} ${isV2 ? 'placeholder:text-gray-400' : 'placeholder:text-gray-500'}`}
                  placeholder="79991234567"
                />
              </Row>

              <Row label="Дата" isV2={isV2}>
                <Input 
                  type="datetime-local"
                  value={order.dateMeeting ? new Date(order.dateMeeting).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => handleDateChange('dateMeeting', e.target.value)}
                  className={`${inputClass} ${isV2 ? 'dark:[color-scheme:dark]' : '[color-scheme:dark]'}`}
                />
              </Row>

              <Row label="Статус" isV2={isV2}>
                <Select value={order.statusOrder} onValueChange={(v) => handleOrderChange('statusOrder', v)}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {STATUS_OPTIONS.filter(o => o.value !== 'all').map((o) => (
                      <SelectItem key={o.value} value={o.value} className={selectItemClass}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </div>
          </div>

          {/* Нижняя часть — на всю ширину */}
          <div className={`mt-5 pt-5 border-t space-y-3 ${isV2 ? 'border-gray-200 dark:border-gray-700' : 'border-[#FFD700]/20'}`}>
            <Row label="Адрес" isV2={isV2}>
              <Input 
                value={order.address} 
                onChange={(e) => handleOrderChange('address', e.target.value)}
                className={inputClass}
              />
            </Row>

            <Row label="Проблема" isV2={isV2}>
              <Textarea 
                value={order.problem} 
                onChange={(e) => handleOrderChange('problem', e.target.value)}
                className={isV2 
                  ? "min-h-[80px] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 resize-none focus:border-[#FEC004] focus-visible:border-[#FEC004]"
                  : "min-h-[80px] bg-[#17212b] border-[#FFD700]/20 text-white resize-none"
                }
              />
            </Row>
          </div>
        </div>

        {/* Footer */}
        <div className={isV2 
          ? "flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]"
          : "flex items-center justify-end gap-3 px-5 py-3 border-t border-[#FFD700]/30 bg-[#17212b]"
        }>
          <Button
            variant="outline"
            onClick={onClose}
            className={isV2 
              ? "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              : "border-gray-600 text-gray-300 hover:bg-gray-800"
            }
          >
            Отмена
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className={isV2 
              ? "bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-medium"
              : "bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#0f0f23] font-medium"
            }
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

const Row = ({ label, children, isV2 = false }: { label: string; children: React.ReactNode; isV2?: boolean }) => (
  <div className="flex items-center gap-3">
    <Label className={`text-sm shrink-0 w-24 ${isV2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>{label}</Label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);
