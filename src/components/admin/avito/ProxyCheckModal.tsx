import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Globe, Loader2, Eye, EyeOff } from 'lucide-react';
import { AvitoAccount, ProxyCheckResult } from '@/types/avito';

interface ProxyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  proxyAccounts: AvitoAccount[];
  loadingProxyData: boolean;
  proxyCheckResults: ProxyCheckResult;
  checkingProxyIds: Set<number>;
  showProxyPasswords: Set<number>;
  onCheckSingleProxy: (account: AvitoAccount) => void;
  onToggleProxyPasswordVisibility: (accountId: number) => void;
  onClearResults: () => void;
}

export const ProxyCheckModal = ({
  isOpen,
  onClose,
  proxyAccounts,
  loadingProxyData,
  proxyCheckResults,
  checkingProxyIds,
  showProxyPasswords,
  onCheckSingleProxy,
  onToggleProxyPasswordVisibility,
  onClearResults,
}: ProxyCheckModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Globe className="mr-3 h-5 w-5 text-blue-600" />
            Проверка прокси аккаунтов
          </DialogTitle>
          <DialogDescription>
            Проверьте состояние прокси для всех аккаунтов Avito
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {loadingProxyData ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Загрузка данных прокси...</h3>
            </div>
          ) : proxyAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет аккаунтов</h3>
              <p className="mt-1 text-sm text-gray-500">
                Добавьте аккаунты для проверки прокси
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {proxyAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {account.proxyHost ? (
                        <div className="space-y-1">
                          <div className="font-mono">
                            {account.proxyType?.toUpperCase()}://{account.proxyHost}:{account.proxyPort}
                          </div>
                          {account.proxyLogin && (
                            <div className="font-mono text-xs text-gray-500 flex items-center space-x-2">
                              <span>
                                Логин: {account.proxyLogin} | Пароль: {
                                  account.proxyPassword 
                                    ? showProxyPasswords.has(account.id) 
                                      ? account.proxyPassword
                                      : '***' + account.proxyPassword.slice(-3)
                                    : 'не указан'
                                }
                              </span>
                              {account.proxyPassword && (
                                <button
                                  onClick={() => onToggleProxyPasswordVisibility(account.id)}
                                  className="text-blue-500 hover:text-blue-700 ml-1"
                                >
                                  {showProxyPasswords.has(account.id) ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Прокси не настроен</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="min-w-[120px] text-right">
                      {proxyCheckResults[account.id] ? (
                        <span className={`text-sm ${
                          proxyCheckResults[account.id].includes('✅') 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {proxyCheckResults[account.id]}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Не проверен</span>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCheckSingleProxy(account)}
                      disabled={checkingProxyIds.has(account.id)}
                      className="min-w-[80px]"
                    >
                      {checkingProxyIds.has(account.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Проверить'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button 
            variant="outline"
            onClick={onClearResults}
          >
            Очистить результаты
          </Button>
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
