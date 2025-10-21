import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Globe, 
  Clock, 
  MessageCircle, 
  Target, 
  Star, 
  ThumbsUp 
} from 'lucide-react';
import { toast } from 'sonner';

interface AvitoToolsSectionProps {
  accountsCount: number;
  onOpenProxyCheckModal: () => void;
  onOpenEternalOnlineModal: () => void;
  onOpenReviewsModal: () => void;
  onRegisterWebhook: () => void;
}

export const AvitoToolsSection = ({ 
  accountsCount, 
  onOpenProxyCheckModal, 
  onOpenEternalOnlineModal, 
  onOpenReviewsModal, 
  onRegisterWebhook 
}: AvitoToolsSectionProps) => {
  if (accountsCount === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="mr-2 h-5 w-5 text-green-600" />
          Инструменты управления
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-300"
            onClick={onOpenProxyCheckModal}
          >
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="text-xs">Проверка прокси</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-green-50 hover:border-green-300"
            onClick={onOpenEternalOnlineModal}
          >
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-xs">Вечный онлайн</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-purple-50 hover:border-purple-300"
            onClick={() => toast.info('Функция "АвтоОтвет" в разработке')}
          >
            <MessageCircle className="h-4 w-4 text-purple-600" />
            <span className="text-xs">АвтоОтвет</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-red-50 hover:border-red-300"
            onClick={() => toast.info('Функция "БидМенеджер" в разработке')}
          >
            <Target className="h-4 w-4 text-red-600" />
            <span className="text-xs">БидМенеджер</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-yellow-50 hover:border-yellow-300"
            onClick={() => toast.info('Функция "Статистика ТОП" в разработке')}
          >
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-xs">Статистика ТОП</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-indigo-50 hover:border-indigo-300"
            onClick={onOpenReviewsModal}
          >
            <ThumbsUp className="h-4 w-4 text-indigo-600" />
            <span className="text-xs">Отзывы</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 flex flex-col items-center justify-center gap-1 hover:bg-teal-50 hover:border-teal-300"
            onClick={onRegisterWebhook}
          >
            <MessageCircle className="h-4 w-4 text-teal-600" />
            <span className="text-xs">Webhook</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
