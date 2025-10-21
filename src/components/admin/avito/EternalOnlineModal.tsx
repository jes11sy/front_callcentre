import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Loader2 } from 'lucide-react';
import { AvitoAccount, OnlineStatuses, EternalOnlineSettings } from '@/types/avito';

interface EternalOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AvitoAccount[];
  onlineStatuses: OnlineStatuses;
  eternalOnlineSettings: EternalOnlineSettings;
  updatingOnlineStatus: Set<number>;
  onToggleEternalOnline: (accountId: number, enabled: boolean) => void;
}

export const EternalOnlineModal = ({
  isOpen,
  onClose,
  accounts,
  onlineStatuses,
  eternalOnlineSettings,
  updatingOnlineStatus,
  onToggleEternalOnline,
}: EternalOnlineModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Clock className="mr-3 h-5 w-5 text-green-600" />
            Вечный онлайн
          </DialogTitle>
          <DialogDescription>
            Управление автоматическим поддержанием профилей в онлайне
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет аккаунтов</h3>
              <p className="mt-1 text-sm text-gray-500">
                Добавьте аккаунты для управления онлайн-статусом
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{account.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">Статус онлайн:</span>
                      <Badge 
                        variant={onlineStatuses[account.id] ? "default" : "secondary"} 
                        className={`text-xs ${
                          onlineStatuses[account.id] 
                            ? "bg-green-500" 
                            : "bg-gray-400"
                        }`}
                      >
                        {onlineStatuses[account.id] ? "🟢 Онлайн" : "⚫ Оффлайн"}
                      </Badge>
                      {eternalOnlineSettings[account.id] && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          🔄 Автоматически
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-700 mb-1">
                        Вечный онлайн
                      </span>
                      <Switch
                        checked={eternalOnlineSettings[account.id] || false}
                        onCheckedChange={(checked) => onToggleEternalOnline(account.id, checked)}
                        disabled={updatingOnlineStatus.has(account.id)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    {updatingOnlineStatus.has(account.id) && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <strong>Как работает &quot;Вечный онлайн&quot;:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>При включении аккаунт автоматически поддерживается в онлайне</li>
                <li>Система периодически проверяет и обновляет статус</li>
                <li>Помогает увеличить видимость ваших объявлений</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
