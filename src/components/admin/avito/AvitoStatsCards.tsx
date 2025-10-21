import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvitoStats } from '@/types/avito';
import { 
  MessageSquare, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Users 
} from 'lucide-react';

interface AvitoStatsCardsProps {
  stats: AvitoStats;
}

export const AvitoStatsCards = ({ stats }: AvitoStatsCardsProps) => {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(balance);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего аккаунтов</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAccounts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.connectedAccounts} подключено
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
          <span className="text-muted-foreground text-lg font-bold">₽</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBalance(stats.totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            CPA баланс всех аккаунтов
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Объявления</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalAds)}</div>
          <p className="text-xs text-muted-foreground">
            Активных объявлений
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Подключения</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.connectedAccounts}</div>
          <p className="text-xs text-muted-foreground">
            Активных подключений
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего просмотров</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalViews)}
          </div>
          <p className="text-xs text-muted-foreground">
            Сегодня: {formatNumber(stats.viewsToday)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего контактов</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalContacts)}
          </div>
          <p className="text-xs text-muted-foreground">
            Сегодня: {formatNumber(stats.contactsToday)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
