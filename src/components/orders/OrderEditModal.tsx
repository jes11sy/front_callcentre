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
import { ORDER_TYPES, STATUS_OPTIONS } from '@/constants/orders';
import { useCities, useRKs, useEquipmentTypes } from '@/hooks/useStaticData';
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
  const { theme } = useDesignStore();
  const { data: cities = [] } = useCities();
  const { data: rks = [] } = useRKs();
  const { data: equipmentTypes = [] } = useEquipmentTypes();

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
  const selectTriggerClass = "h-9 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_[data-placeholder]]:text-gray-400 [&_svg]:text-gray-500 dark:[&_svg]:text-gray-400 focus:border-[#FEC004] focus-visible:border-[#FEC004] focus-visible:ring-2 focus-visible:ring-[#FEC004]/20 focus-visible:ring-offset-0";
  
  const selectContentClass = "bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600";
  
  const selectItemClass = "text-gray-700 dark:text-gray-200 data-[highlighted]:bg-[#FEC004]/10 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100";
  
  const inputClass = "h-9 bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-[#FEC004] focus-visible:border-[#FEC004]";

  return (
    <div 
      className="fixed inset-0 z-[9997] flex items-end lg:items-center lg:justify-center bg-black/50 lg:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full h-[calc(100vh-64px)] lg:h-auto lg:w-[672px] lg:max-h-[85vh] lg:rounded-lg overflow-hidden flex flex-col bg-[#F3F3EE] dark:bg-[#1e2530] shadow-xl dark:shadow-none lg:border border-gray-200 dark:border-gray-700 font-myriad"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            Редактирование #{order.id}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5">
          {/* Две колонки на десктопе, одна на мобильных */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Левая колонка — Информация по заказу */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium pb-2 border-b text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">Информация по заказу</h3>
              
              <Row label="Тип заявки">
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

              <Row label="Тип техники">
                <Select value={order.equipmentTypeId?.toString() || ''} onValueChange={(v) => handleOrderChange('equipmentTypeId', Number(v))}>
                  <SelectTrigger className={`${selectTriggerClass} w-full`}>
                    <span className="truncate">{order.equipmentType?.name || 'Выберите'}</span>
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {equipmentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()} className={selectItemClass}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="РК">
                <Select value={order.rkId?.toString() || ''} onValueChange={(v) => handleOrderChange('rkId', Number(v))}>
                  <SelectTrigger className={`${selectTriggerClass} w-full`}>
                    <span className="truncate">{order.rk?.name || 'Выберите'}</span>
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {rks.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()} className={selectItemClass}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>

              <Row label="Авито">
                <span className="text-sm text-gray-500 dark:text-gray-400">{order.avito?.name || '—'}</span>
              </Row>

              <Row label="Город">
                <Select value={order.cityId?.toString() || ''} onValueChange={(v) => handleOrderChange('cityId', Number(v))}>
                  <SelectTrigger className={selectTriggerClass}>
                    <span className="truncate">{order.city?.name || 'Выберите'}</span>
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()} className={selectItemClass}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </div>

            {/* Правая колонка — Контакты и время */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium pb-2 border-b text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">Контакты и время</h3>
              
              <Row label="Клиент">
                <Input 
                  value={order.clientName} 
                  onChange={(e) => handleOrderChange('clientName', e.target.value)}
                  className={inputClass}
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
                  className={`${inputClass} placeholder:text-gray-400`}
                  placeholder="79991234567"
                />
              </Row>

              <Row label="Дата">
                <Input 
                  type="datetime-local"
                  value={order.dateMeeting ? new Date(order.dateMeeting).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => handleDateChange('dateMeeting', e.target.value)}
                  className={`${inputClass} dark:[color-scheme:dark]`}
                />
              </Row>

              <Row label="Статус">
                <Select value={order.status?.name || ''} onValueChange={(v) => handleOrderChange('status', { ...order.status, name: v })}>
                  <SelectTrigger className={selectTriggerClass}>
                    <span className="truncate">{order.status?.name || 'Выберите'}</span>
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
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t space-y-3 border-gray-200 dark:border-gray-700">
            <Row label="Адрес">
              <Input 
                value={order.address || ''} 
                onChange={(e) => handleOrderChange('address', e.target.value)}
                className={inputClass}
              />
            </Row>

            <Row label="Примечание">
              <Textarea 
                value={order.description || ''} 
                onChange={(e) => handleOrderChange('description', e.target.value)}
                className="min-h-[60px] sm:min-h-[80px] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 resize-none focus:border-[#FEC004] focus-visible:border-[#FEC004]"
                placeholder="Примечание к заказу..."
              />
            </Row>
          </div>

          {/* Контроль качества */}
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t space-y-3 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium pb-2 border-b text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">Контроль качества</h3>
            
            <Row label="Статус КК">
              <Select value={order.qaStatus || 'none'} onValueChange={(v) => handleOrderChange('qaStatus', v === 'none' ? null : v)}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Не проверено" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="none" className={selectItemClass}>—</SelectItem>
                  <SelectItem value="Проверено" className={selectItemClass}>Проверено</SelectItem>
                  <SelectItem value="Не проверено" className={selectItemClass}>Не проверено</SelectItem>
                  <SelectItem value="Не отвечает" className={selectItemClass}>Не отвечает</SelectItem>
                  <SelectItem value="Расхождение" className={selectItemClass}>Расхождение</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            <Row label="Сумма ОК">
              <Select value={order.qaAmountConfirmed === true ? 'yes' : order.qaAmountConfirmed === false ? 'no' : 'none'} onValueChange={(v) => handleOrderChange('qaAmountConfirmed', v === 'yes' ? true : v === 'no' ? false : null)}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="none" className={selectItemClass}>—</SelectItem>
                  <SelectItem value="yes" className={selectItemClass}>Да</SelectItem>
                  <SelectItem value="no" className={selectItemClass}>Нет</SelectItem>
                </SelectContent>
              </Select>
            </Row>

            <Row label="Примечание КК">
              <Textarea 
                value={order.qaNote || ''} 
                onChange={(e) => handleOrderChange('qaNote', e.target.value)}
                className="min-h-[60px] bg-white dark:bg-[#252d3a] border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 resize-none focus:border-[#FEC004] focus-visible:border-[#FEC004]"
                placeholder="Комментарий по проверке..."
              />
            </Row>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252d3a]">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Отмена
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="text-sm bg-[#FEC004] hover:bg-[#e6ac00] text-gray-900 font-medium"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Сохранение...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Сохранить</span>
                <span className="sm:hidden">ОК</span>
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
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
    <Label className="text-xs sm:text-sm shrink-0 sm:w-24 text-gray-500 dark:text-gray-400">{label}</Label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);
