'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Filter, RefreshCw, Settings, Users } from 'lucide-react';

interface QuickActionsProps {
  onRefresh: () => void;
  onOpenSoundSettings: () => void;
  loading: boolean;
  filterUnread: boolean;
  onToggleFilterUnread: () => void;
  accounts: unknown[];
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  accountsLoading: boolean;
  onRetry?: () => void;
}

export function QuickActions({
  onRefresh,
  onOpenSoundSettings,
  loading,
  filterUnread,
  onToggleFilterUnread,
  accounts,
  selectedAccount,
  onAccountChange,
  accountsLoading,
  onRetry: _onRetry
}: QuickActionsProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-3">
      <div className="flex justify-between items-center gap-2">
        {/* Account Selector - Left side */}
        <div className="flex-1 max-w-[200px]">
          <Select
            value={selectedAccount}
            onValueChange={onAccountChange}
            disabled={accountsLoading}
          >
            <SelectTrigger className="bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9] h-8">
              <SelectValue placeholder={
                accountsLoading 
                  ? "Загрузка..." 
                  : !accounts || accounts.length === 0 
                    ? "Нет аккаунтов" 
                    : "Выберите аккаунт"
              } />
            </SelectTrigger>
            <SelectContent className="bg-[#02111B] border-[#F8F7F9]/30">
              {accounts && accounts.length > 1 && (
                <SelectItem value="__ALL__" className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-[#9EA93F]" />
                    <span>Все аккаунты</span>
                  </div>
                </SelectItem>
              )}
              {accounts && accounts.map((account: unknown, _index: number) => {
                const accountData = account as { id: string; name: string; connectionStatus: string };
                return (
                <SelectItem key={accountData.id} value={accountData.name} className="text-[#F8F7F9] hover:bg-[#F8F7F9]/20">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      accountData.connectionStatus === 'connected' ? "bg-green-400" :
                      accountData.connectionStatus === 'disconnected' ? "bg-red-400" :
                      "bg-gray-400"
                    )} />
                    {accountData.name}
                  </div>
                </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons - Right side */}
        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={cn(
                "text-[#9EA93F] hover:text-[#02111B] hover:bg-[#F8F7F9]",
                filterUnread && "text-[#02111B] bg-[#F8F7F9]"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#02111B] border border-[#F8F7F9]/30 rounded-lg shadow-lg z-10 min-w-[200px]">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onToggleFilterUnread();
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm text-[#F8F7F9] hover:bg-[#F8F7F9]/20 ${
                      filterUnread ? 'bg-[#F8F7F9] text-[#02111B]' : ''
                    }`}
                  >
                    Только непрочитанные
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-[#9EA93F] hover:text-[#02111B] hover:bg-[#F8F7F9]"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSoundSettings}
            className="text-[#9EA93F] hover:text-[#02111B] hover:bg-[#F8F7F9]"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
