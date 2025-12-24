'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { useFileUrls } from '@/lib/s3-utils';
import { 
  User, 
  Settings, 
  AlertCircle, 
  XCircle,
  FileText 
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
      // Создаем дату из локального времени, но сохраняем как UTC
      const localDate = new Date(value);
      const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
      handleOrderChange(field, utcDate.toISOString());
    } else {
      handleOrderChange(field, '');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f0f23] rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] w-[85vw] h-[80vh] max-w-none max-h-none flex flex-col border-2 border-[#FFD700]"
        style={{ width: '85vw', height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-[#FFD700]/30">
          <div>
            <h2 className="text-2xl font-bold text-[#FFD700]">Редактирование заказа</h2>
            <p className="text-gray-400">ID: #{order.id}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-[#FFD700]/10"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Навигация по вкладкам */}
        <div className="flex border-b border-[#FFD700]/30">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-[#FFD700] text-[#FFD700]'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Описание
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'master'
                ? 'border-[#FFD700] text-[#FFD700]'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Мастер
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-[#FFD700] text-[#FFD700]'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Документы
          </button>
        </div>

        {/* Содержимое вкладок */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'description' && (
            <OrderDescriptionEditTab 
              order={order} 
              userRole={userRole}
              onOrderChange={handleOrderChange}
              onDateChange={handleDateChange}
            />
          )}

          {activeTab === 'master' && (
            <OrderMasterEditTab 
              order={order} 
              userRole={userRole}
              onOrderChange={handleOrderChange}
            />
          )}

          {activeTab === 'documents' && (
            <OrderDocumentsEditTab 
              order={order} 
              userRole={userRole}
              onOrderChange={handleOrderChange}
            />
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#FFD700]/30">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
          >
            Отмена
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF8C00] text-[#0f0f23] font-semibold"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Компонент для редактирования описания
const OrderDescriptionEditTab = ({ 
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
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Основная информация */}
      <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-[#FFD700]" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-400">РК</Label>
            <Input 
              value={order.rk} 
              disabled={userRole === 'operator'}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Город</Label>
            <Input 
              value={order.city} 
              onChange={(e) => onOrderChange('city', e.target.value)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Источник</Label>
            <Input 
              value={order.avitoName || ''} 
              onChange={(e) => onOrderChange('avitoName', e.target.value)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
              placeholder="Источник заказа"
            />
          </div>
        </CardContent>
      </Card>

      {/* Детали заказа */}
      <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-[#FFD700]" />
            Детали заказа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-400">Клиент</Label>
            <Input 
              value={order.clientName} 
              disabled={userRole === 'operator'}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Телефон</Label>
            <Input 
              value={order.phone || ''} 
              onChange={(e) => onOrderChange('phone', e.target.value)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Тип заявки</Label>
            <Select 
              value={order.typeOrder} 
              onValueChange={(value: string) => onOrderChange('typeOrder', value)}
            >
              <SelectTrigger className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white">
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
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Адрес</Label>
            <Input 
              value={order.address} 
              onChange={(e) => onOrderChange('address', e.target.value)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Дата встречи</Label>
            <Input 
              type="datetime-local"
              value={order.dateMeeting ? new Date(order.dateMeeting).toISOString().slice(0, 16) : ''} 
              onChange={(e) => onDateChange('dateMeeting', e.target.value)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Тип техники</Label>
            <Select 
              value={order.typeEquipment} 
              onValueChange={(value: string) => onOrderChange('typeEquipment', value)}
            >
              <SelectTrigger className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white">
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
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Статус</Label>
            <Select 
              value={order.statusOrder} 
              onValueChange={(value: string) => onOrderChange('statusOrder', value)}
            >
              <SelectTrigger className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#17212b] border-[#FFD700]/30">
                {STATUS_OPTIONS.filter(option => option.value !== 'all').map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#FFD700]/10">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Описание проблемы */}
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <AlertCircle className="h-5 w-5 text-[#FFD700]" />
          Описание проблемы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={order.problem} 
          onChange={(e) => onOrderChange('problem', e.target.value)}
          className="min-h-[100px] bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
          placeholder="Опишите проблему..."
        />
      </CardContent>
    </Card>

    {/* Оператор */}
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-[#FFD700]" />
          Оператор
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-gray-400">Имя оператора</Label>
            <p className="text-lg font-semibold text-white">{order.operator.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">ID оператора</Label>
            <p className="text-lg font-mono text-white">{order.operatorNameId}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-400">Запись звонка</Label>
          <Input 
            value={order.callRecord || ''} 
            disabled={userRole === 'operator'}
            className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
            placeholder="Название файла записи..."
          />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Компонент для редактирования мастера
const OrderMasterEditTab = ({ 
  order, 
  userRole, 
  onOrderChange 
}: { 
  order: Order; 
  userRole?: string; 
  onOrderChange: (field: keyof Order, value: unknown) => void;
}) => (
  <div className="space-y-6">
    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-[#FFD700]" />
          Информация о мастере
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-400">Имя мастера</Label>
            <Input 
              value={order.master?.name || ''} 
              disabled
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
              placeholder="Не назначен"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-[#FFD700]" />
          Финансовые результаты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-sm font-medium text-gray-400">Итог</Label>
            <Input 
              type="number"
              value={order.result || ''} 
              disabled={userRole === 'operator'}
              onChange={(e) => onOrderChange('result', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
              placeholder="Сумма в рублях"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Расходы</Label>
            <Input 
              type="number"
              value={order.expenditure || ''} 
              disabled={userRole === 'operator'}
              onChange={(e) => onOrderChange('expenditure', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
              placeholder="Сумма в рублях"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-400">Чистая прибыль</Label>
            <Input 
              type="number"
              value={order.clean || ''} 
              disabled={userRole === 'operator'}
              onChange={(e) => onOrderChange('clean', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 bg-[#0f0f23] border-[#FFD700]/30 text-white placeholder:text-gray-500"
              placeholder="Сумма в рублях"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Компонент для редактирования документов
const OrderDocumentsEditTab = ({ 
  order, 
  userRole, 
  onOrderChange 
}: { 
  order: Order; 
  userRole?: string; 
  onOrderChange: (field: keyof Order, value: unknown) => void;
}) => {
  const { url: bsoUrls, loading: bsoLoading } = useFileUrls(order.bsoDoc || []);
  const { url: expenditureUrls, loading: expenditureLoading } = useFileUrls(order.expenditureDoc || []);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-[#FFD700]" />
            Документы заказа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* БСО документ */}
            <div>
              <Label className="text-sm font-medium text-gray-400 mb-2 block">
                БСО документ {order.bsoDoc && order.bsoDoc.length > 0 && `(${order.bsoDoc.length})`}
              </Label>
              {order.bsoDoc && order.bsoDoc.length > 0 ? (
                <div className="space-y-2">
                  {bsoLoading ? (
                    <div className="flex items-center justify-center p-4 bg-[#0f0f23] border-2 border-green-500/30 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
                        <span className="text-gray-400 text-sm">Загрузка...</span>
                      </div>
                    </div>
                  ) : (
                    order.bsoDoc.map((doc, index) => {
                      const url = bsoUrls[doc];
                      return (
                        <a 
                          key={index}
                          href={url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-500/30 rounded-lg hover:bg-green-900/50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-green-300 text-sm truncate flex-1">
                            {order.bsoDoc!.length > 1 ? `Документ БСО #${index + 1}` : 'Документ БСО'}
                          </span>
                          <span className="text-green-400 text-xs">↗</span>
                        </a>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 bg-[#0f0f23] border-2 border-[#FFD700]/30 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-400 text-sm">Документ не загружен</span>
                  </div>
                </div>
              )}
            </div>

            {/* Документ расходов */}
            <div>
              <Label className="text-sm font-medium text-gray-400 mb-2 block">
                Документ расходов {order.expenditureDoc && order.expenditureDoc.length > 0 && `(${order.expenditureDoc.length})`}
              </Label>
              {order.expenditureDoc && order.expenditureDoc.length > 0 ? (
                <div className="space-y-2">
                  {expenditureLoading ? (
                    <div className="flex items-center justify-center p-4 bg-[#0f0f23] border-2 border-blue-500/30 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <span className="text-gray-400 text-sm">Загрузка...</span>
                      </div>
                    </div>
                  ) : (
                    order.expenditureDoc.map((doc, index) => {
                      const url = expenditureUrls[doc];
                      return (
                        <a 
                          key={index}
                          href={url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg hover:bg-blue-900/50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <span className="text-blue-300 text-sm truncate flex-1">
                            {order.expenditureDoc!.length > 1 ? `Документ расходов #${index + 1}` : 'Документ расходов'}
                          </span>
                          <span className="text-blue-400 text-xs">↗</span>
                        </a>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 bg-[#0f0f23] border-2 border-[#FFD700]/30 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-400 text-sm">Документ не загружен</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    <Card className="border-2 border-[#FFD700]/30 bg-[#17212b]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Settings className="h-5 w-5 text-[#FFD700]" />
          Системная информация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Дата создания:</span>
              <span className="font-medium text-white">{new Date(order.createDate).toLocaleString('ru-RU')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Последнее обновление:</span>
              <span className="font-medium text-white">{order.updatedAt ? new Date(order.updatedAt).toLocaleString('ru-RU') : 'Не указано'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">ID заказа:</span>
              <span className="font-medium text-white">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ID оператора:</span>
              <span className="font-medium text-white">{order.operatorNameId}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};
