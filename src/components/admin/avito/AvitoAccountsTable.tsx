import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Loader2, 
  MessageSquare, 
  RefreshCw, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { AvitoAccount } from '@/types/avito';

interface AvitoAccountsTableProps {
  accounts: AvitoAccount[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSyncAll: () => void;
  syncingAll: boolean;
  onEditAccount: (account: AvitoAccount) => void;
  onDeleteAccount: (account: AvitoAccount) => void;
  onSyncAccount: (account: AvitoAccount) => void;
  syncingAccount: number | null;
}

export const AvitoAccountsTable = ({
  accounts,
  loading,
  searchTerm,
  onSearchChange,
  onSyncAll,
  syncingAll,
  onEditAccount,
  onDeleteAccount,
  onSyncAccount,
  syncingAccount,
}: AvitoAccountsTableProps) => {
  const getConnectionStatusBadge = (status?: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="text-xs bg-green-500">Подключен</Badge>;
      case 'disconnected':
        return <Badge variant="destructive" className="text-xs">Отключен</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Не проверен</Badge>;
    }
  };

  const getProxyStatusBadge = (account: AvitoAccount) => {
    if (!account.proxyHost) {
      return <Badge variant="outline" className="text-xs">Без прокси</Badge>;
    }

    switch (account.proxyStatus) {
      case 'working':
        return <Badge variant="default" className="text-xs bg-green-500">Работает</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Ошибка</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Не проверен</Badge>;
    }
  };

  const formatBalance = (balance?: number) => {
    if (balance === null || balance === undefined) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(balance);
  };

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return '—';
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatNumberWithToday = (total?: number, today?: number) => {
    if (total === null || total === undefined) return '—';
    const totalFormatted = new Intl.NumberFormat('ru-RU').format(total);
    
    if (today && today > 0) {
      const todayFormatted = new Intl.NumberFormat('ru-RU').format(today);
      return `${totalFormatted} (+${todayFormatted} сегодня)`;
    }
    
    return totalFormatted;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Аккаунты Avito</CardTitle>
            <CardDescription>
              Управление аккаунтами для интеграции с Avito API
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск аккаунтов..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              variant="outline"
              onClick={onSyncAll}
              disabled={syncingAll || accounts.length === 0}
              className="flex items-center"
            >
              {syncingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Синхронизация...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Синхронизировать все
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет аккаунтов</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Аккаунты не найдены' : 'Начните с добавления первого аккаунта Avito'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя аккаунта</TableHead>
                <TableHead>Статус подключения</TableHead>
                <TableHead>Проверка прокси</TableHead>
                <TableHead>CPA Баланс</TableHead>
                <TableHead>Кол-во объявлений</TableHead>
                <TableHead>Кол-во просмотров</TableHead>
                <TableHead>Кол-во контактов</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {account.clientId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getConnectionStatusBadge(account.connectionStatus)}</TableCell>
                  <TableCell>{getProxyStatusBadge(account)}</TableCell>
                  <TableCell className="font-mono">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-1 text-sm font-bold">₽</span>
                      {formatBalance(account.accountBalance)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-blue-600" />
                      {formatNumber(account.adsCount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-purple-600" />
                      {formatNumberWithToday(account.viewsCount, account.viewsToday)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-orange-600" />
                      {formatNumberWithToday(account.contactsCount, account.contactsToday)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSyncAccount(account)}
                        disabled={syncingAccount === account.id}
                        title="Синхронизировать данные"
                      >
                        {syncingAccount === account.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditAccount(account)}
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteAccount(account)}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
