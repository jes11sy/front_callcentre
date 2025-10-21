'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, RefreshCw } from 'lucide-react';

interface AvitoAccount {
  id: number;
  name: string;
  connectionStatus: string;
  userId: number;
  isOnline: boolean;
  lastActivity?: number;
  proxyStatus?: 'working' | 'failed' | 'not_checked';
}

interface AccountSelectorProps {
  accounts: AvitoAccount[];
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  loading?: boolean;
  onRetry?: () => void;
}

export function AccountSelector({
  accounts,
  selectedAccount,
  onAccountChange,
  loading = false,
  onRetry
}: AccountSelectorProps) {
  return (
    <div className="p-3 border-b border-[#F8F7F9]/30">
      <Select
        value={selectedAccount}
        onValueChange={onAccountChange}
        disabled={loading}
      >
        <SelectTrigger className="bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9]">
          <SelectValue placeholder={
            loading 
              ? "Загрузка..." 
              : accounts.length === 0 
                ? "Нет аккаунтов" 
                : "Выберите аккаунт"
          } />
        </SelectTrigger>
        <SelectContent className="bg-[#02111B] border-[#F8F7F9]/30">
          {accounts.length > 1 && (
            <SelectItem value="__ALL__" className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-[#9EA93F]" />
                <span>Все аккаунты</span>
              </div>
            </SelectItem>
          )}
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.name} className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  account.connectionStatus === 'connected' ? "bg-green-400" :
                  account.connectionStatus === 'disconnected' ? "bg-red-400" :
                  "bg-gray-400"
                )} />
                {account.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Retry button if no accounts */}
      {accounts.length === 0 && !loading && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="w-full mt-2 bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9] hover:bg-[#F8F7F9] hover:text-[#02111B]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить список аккаунтов
        </Button>
      )}
    </div>
  );
}
