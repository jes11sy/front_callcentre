'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { useFileUrls } from '@/lib/s3-utils';
import { 
  User, 
  X,
  FileText,
  Briefcase,
  Save
} from 'lucide-react';
import { Order, OrderTab } from '@/types/orders';
import { ORDER_TYPES, EQUIPMENT_TYPES, STATUS_OPTIONS } from '@/constants/orders';

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
  const [activeTab, setActiveTab] = useState<OrderTab>('description');

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

  const tabs = [
    { id: 'description' as OrderTab, label: 'Информация', icon: FileText },
    { id: 'master' as OrderTab, label: 'Мастер', icon: Briefcase },
    { id: 'documents' as OrderTab, label: 'Документы', icon: FileText },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-[#FFD700]/40 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFD700]/20 bg-[#17212b]">
          <div>
            <h2 className="text-lg font-semibold text-[#FFD700]">
              Редактирование #{order.id}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#FFD700]/20 bg-[#17212b]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#FFD700] border-b-2 border-[#FFD700] -mb-px'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      
        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          {activeTab === 'description' && (
            <DescriptionEditTab 
              order={order} 
              userRole={userRole}
              onOrderChange={handleOrderChange}
              onDateChange={handleDateChange}
            />
          )}

          {activeTab === 'master' && (
            <MasterEditTab 
              order={order} 
              userRole={userRole}
              onOrderChange={handleOrderChange}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsEditTab order={order} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#FFD700]/20 bg-[#17212b]">
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

// === Вкладка "Информация" ===
const DescriptionEditTab = ({ 
  order, 
  userRole, 
  onOrderChange, 
  onDateChange 
}: { 
  order: Order; 
  userRole?: string; 
  onOrderChange: (field: keyof Order, value: unknown) => void;
  onDateChange: (field: 'dateMeeting', value: string) => void;
}) => (
  <div className="space-y-4">
    {/* Основные поля — сетка 2 колонки */}
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Клиент" disabled={userRole === 'operator'}>
        <Input 
          value={order.clientName} 
          disabled={userRole === 'operator'}
          className="bg-[#17212b] border-[#FFD700]/20 text-white"
        />
      </FormField>
      
      <FormField label="Телефон">
        <Input 
          value={order.phone || ''} 
          onChange={(e) => onOrderChange('phone', e.target.value)}
          className="bg-[#17212b] border-[#FFD700]/20 text-white"
          placeholder="Не указан"
        />
      </FormField>

      <FormField label="РК" disabled={userRole === 'operator'}>
        <Input 
          value={order.rk} 
          disabled={userRole === 'operator'}
          className="bg-[#17212b] border-[#FFD700]/20 text-white"
        />
      </FormField>

      <FormField label="Город">
        <Input 
          value={order.city} 
          onChange={(e) => onOrderChange('city', e.target.value)}
          className="bg-[#17212b] border-[#FFD700]/20 text-white"
        />
      </FormField>

      <FormField label="Источник">
        <Input 
          value={order.avitoName || ''} 
          onChange={(e) => onOrderChange('avitoName', e.target.value)}
          className="bg-[#17212b] border-[#FFD700]/20 text-white"
          placeholder="Не указан"
        />
      </FormField>

      <FormField label="Дата встречи">
        <Input 
          type="datetime-local"
          value={order.dateMeeting ? new Date(order.dateMeeting).toISOString().slice(0, 16) : ''} 
          onChange={(e) => onDateChange('dateMeeting', e.target.value)}
          className="bg-[#17212b] border-[#FFD700]/20 text-white [color-scheme:dark]"
        />
      </FormField>
    </div>

    {/* Адрес — полная ширина */}
    <FormField label="Адрес">
      <Input 
        value={order.address} 
        onChange={(e) => onOrderChange('address', e.target.value)}
        className="bg-[#17212b] border-[#FFD700]/20 text-white"
      />
    </FormField>

    {/* Селекты в ряд */}
    <div className="grid grid-cols-3 gap-4">
      <FormField label="Тип заявки">
        <Select 
          value={order.typeOrder} 
          onValueChange={(value) => onOrderChange('typeOrder', value)}
        >
          <SelectTrigger className="bg-[#17212b] border-[#FFD700]/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
            {ORDER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#FFD700]/10">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Тип техники">
        <Select 
          value={order.typeEquipment} 
          onValueChange={(value) => onOrderChange('typeEquipment', value)}
        >
          <SelectTrigger className="bg-[#17212b] border-[#FFD700]/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#FFD700]/10">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Статус">
        <Select 
          value={order.statusOrder} 
          onValueChange={(value) => onOrderChange('statusOrder', value)}
        >
          <SelectTrigger className="bg-[#17212b] border-[#FFD700]/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
            {STATUS_OPTIONS.filter(opt => opt.value !== 'all').map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#FFD700]/10">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>

    {/* Проблема */}
    <FormField label="Описание проблемы">
      <Textarea 
        value={order.problem} 
        onChange={(e) => onOrderChange('problem', e.target.value)}
        className="min-h-[80px] bg-[#17212b] border-[#FFD700]/20 text-white resize-none"
      />
    </FormField>

    {/* Оператор — только чтение */}
    <div className="flex items-center justify-between p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-400">Оператор:</span>
        <span className="text-sm text-white">{order.operator.name}</span>
      </div>
      <span className="text-xs text-gray-500">ID: {order.operatorNameId}</span>
    </div>
  </div>
);

// === Вкладка "Мастер" ===
const MasterEditTab = ({ 
  order, 
  userRole, 
  onOrderChange 
}: { 
  order: Order; 
  userRole?: string; 
  onOrderChange: (field: keyof Order, value: unknown) => void;
}) => (
  <div className="space-y-5">
    {/* Мастер */}
    <div className="p-4 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
          <User className="h-5 w-5 text-[#FFD700]" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Мастер</Label>
          <p className="text-white font-medium">
            {order.master?.name || <span className="text-gray-500">Не назначен</span>}
          </p>
        </div>
        {order.masterId && (
          <span className="ml-auto text-xs text-gray-500">ID: {order.masterId}</span>
        )}
      </div>
    </div>

    {/* Финансы */}
    <div>
      <Label className="text-xs text-gray-400 mb-3 block">Финансовые результаты</Label>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Итог (₽)">
          <Input 
            type="number"
            value={order.result || ''} 
            disabled={userRole === 'operator'}
            onChange={(e) => onOrderChange('result', e.target.value ? parseInt(e.target.value) : null)}
            className="bg-[#17212b] border-green-500/30 text-green-400 placeholder:text-gray-600"
            placeholder="0"
          />
        </FormField>
        
        <FormField label="Расходы (₽)">
          <Input 
            type="number"
            value={order.expenditure || ''} 
            disabled={userRole === 'operator'}
            onChange={(e) => onOrderChange('expenditure', e.target.value ? parseInt(e.target.value) : null)}
            className="bg-[#17212b] border-red-500/30 text-red-400 placeholder:text-gray-600"
            placeholder="0"
          />
        </FormField>
        
        <FormField label="Чистая (₽)">
          <Input 
            type="number"
            value={order.clean || ''} 
            disabled={userRole === 'operator'}
            onChange={(e) => onOrderChange('clean', e.target.value ? parseInt(e.target.value) : null)}
            className="bg-[#17212b] border-blue-500/30 text-blue-400 placeholder:text-gray-600"
            placeholder="0"
          />
        </FormField>
      </div>
    </div>
  </div>
);

// === Вкладка "Документы" ===
const DocumentsEditTab = ({ order }: { order: Order }) => {
  const { url: bsoUrls, loading: bsoLoading } = useFileUrls(order.bsoDoc || []);
  const { url: expenditureUrls, loading: expenditureLoading } = useFileUrls(order.expenditureDoc || []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* БСО */}
        <div>
          <Label className="text-xs text-gray-400 mb-2 block">
            БСО документы {order.bsoDoc?.length ? `(${order.bsoDoc.length})` : ''}
          </Label>
          {order.bsoDoc && order.bsoDoc.length > 0 ? (
            <div className="space-y-2">
              {bsoLoading ? (
                <LoadingPlaceholder color="green" />
              ) : (
                order.bsoDoc.map((doc, index) => (
                  <DocumentLink 
                    key={index}
                    url={bsoUrls[doc]}
                    label={`БСО #${index + 1}`}
                    color="green"
                  />
                ))
              )}
            </div>
          ) : (
            <EmptyDocPlaceholder />
          )}
        </div>

        {/* Расходы */}
        <div>
          <Label className="text-xs text-gray-400 mb-2 block">
            Документы расходов {order.expenditureDoc?.length ? `(${order.expenditureDoc.length})` : ''}
          </Label>
          {order.expenditureDoc && order.expenditureDoc.length > 0 ? (
            <div className="space-y-2">
              {expenditureLoading ? (
                <LoadingPlaceholder color="blue" />
              ) : (
                order.expenditureDoc.map((doc, index) => (
                  <DocumentLink 
                    key={index}
                    url={expenditureUrls[doc]}
                    label={`Расход #${index + 1}`}
                    color="blue"
                  />
                ))
              )}
            </div>
          ) : (
            <EmptyDocPlaceholder />
          )}
        </div>
      </div>

      {/* Системная информация */}
      <div className="p-3 bg-[#17212b] rounded-lg border border-[#FFD700]/20">
        <Label className="text-xs text-gray-400 mb-2 block">Системная информация</Label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Создан:</span>
            <span className="text-gray-300">{new Date(order.createDate).toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Обновлён:</span>
            <span className="text-gray-300">{order.updatedAt ? new Date(order.updatedAt).toLocaleString('ru-RU') : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Вспомогательные компоненты ===

const FormField = ({ 
  label, 
  children, 
  disabled = false 
}: { 
  label: string; 
  children: React.ReactNode; 
  disabled?: boolean;
}) => (
  <div className={disabled ? 'opacity-60' : ''}>
    <Label className="text-xs text-gray-400 mb-1.5 block">{label}</Label>
    {children}
  </div>
);

const DocumentLink = ({ 
  url, 
  label, 
  color 
}: { 
  url?: string; 
  label: string; 
  color: 'green' | 'blue';
}) => {
  const colors = {
    green: 'bg-green-900/30 border-green-500/30 text-green-300 hover:bg-green-900/50',
    blue: 'bg-blue-900/30 border-blue-500/30 text-blue-300 hover:bg-blue-900/50',
  };
  const iconColors = {
    green: 'text-green-400',
    blue: 'text-blue-400',
  };

  return (
    <a 
      href={url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 border rounded-lg transition-colors ${colors[color]}`}
    >
      <FileText className={`h-4 w-4 ${iconColors[color]}`} />
      <span className="text-sm truncate flex-1">{label}</span>
      <span className="text-xs opacity-60">↗</span>
    </a>
  );
};

const LoadingPlaceholder = ({ color }: { color: 'green' | 'blue' }) => {
  const borderColor = color === 'green' ? 'border-green-500/30' : 'border-blue-500/30';
  const spinnerColor = color === 'green' ? 'border-green-400' : 'border-blue-400';
  
  return (
    <div className={`flex items-center justify-center p-4 bg-[#17212b] border ${borderColor} rounded-lg`}>
      <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${spinnerColor}`} />
    </div>
  );
};

const EmptyDocPlaceholder = () => (
  <div className="flex items-center justify-center p-6 bg-[#17212b] border border-dashed border-gray-700 rounded-lg">
    <span className="text-xs text-gray-500">Нет документов</span>
  </div>
);
