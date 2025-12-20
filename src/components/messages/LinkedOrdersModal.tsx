'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, ExternalLink, Phone, MapPin } from 'lucide-react';

interface LinkedOrder {
  id: number;
  rk: string;
  city: string;
  avitoName?: string;
  avitoChatId?: string;
  phone: string;
  typeOrder: 'first_time' | 'repeat' | 'warranty';
  clientName: string;
  address: string;
  dateMeeting: string;
  typeEquipment: 'kp' | 'bt' | 'mnch';
  problem: string;
  callRecord?: string;
  statusOrder: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  result?: number;
  expenditure?: number;
  clean?: number;
  bsoDoc?: string[];
  expenditureDoc?: string[];
  masterId?: number;
  operatorNameId: number;
  createDate: string;
  closingData?: string;
  createdAt: string;
  updatedAt: string;
  operator: {
    id: number;
    name: string;
    login: string;
  };
  avito?: {
    id: number;
    name: string;
  };
}

interface AvitoChat {
  id: string;
  created: number;
  updated: number;
  itemInfo?: {
    id: number;
    title: string;
    price?: string;
    url: string;
    image?: string;
    status: number;
    city?: string;
  };
  lastMessage?: {
    id: string;
    authorId: number;
    text: string;
    created: number;
    direction: 'in' | 'out';
    type: string;
    isRead?: boolean;
  };
  users: Array<{
    id: number;
    name: string;
    avatar?: string;
    profileUrl?: string;
  }>;
  avitoAccountName: string;
  city: string;
  rk: string;
  unreadCount?: number;
  hasNewMessage?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  status?: 'active' | 'waiting' | 'closed' | 'spam';
  lastSeen?: number;
  responseTime?: number;
  messageCount?: number;
  context?: {
    type: string;
    value: {
      id: number;
      title: string;
      price?: string;
      url: string;
      image?: string;
      status: number;
      city?: string;
    };
  };
}

interface LinkedOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: AvitoChat | null;
  orders: LinkedOrder[];
  loading: boolean;
  onOrderClick: (orderId: number) => void;
}

export function LinkedOrdersModal({
  open,
  onOpenChange,
  chat,
  orders,
  loading,
  onOrderClick
}: LinkedOrdersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-[#0f0f23] border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FFD700]">
            <span className="text-2xl">🔗</span>
            Привязанные заказы
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-gray-400">
            Заказы, созданные из этого чата Авито
            {chat && (
              <Badge variant="outline" className="text-xs font-mono border-[#FFD700]/30 text-[#FFD700]">
                ID: {chat.id}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" />
              <span className="ml-2 text-gray-300">Загрузка заказов...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <FileText className="h-12 w-12 mb-4 text-gray-600" />
              <p className="text-lg font-medium">Нет привязанных заказов</p>
              <p className="text-sm">Для этого чата еще не создано ни одного заказа</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-2 border-[#FFD700]/30 hover:border-[#FFD700]/50 transition-colors bg-[#17212b]">
                    <CardContent className="p-4">
                      {/* Header with ID and Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs border-[#FFD700]/30 text-[#FFD700]">
                            #{order.id}
                          </Badge>
                          <Badge 
                            className={`text-xs font-medium ${
                              order.statusOrder === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              order.statusOrder === 'assigned' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                              order.statusOrder === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              order.statusOrder === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              order.statusOrder === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {order.statusOrder}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onOrderClick(order.id);
                          }}
                          className="text-[#FFD700] border-[#FFD700]/30 hover:bg-[#FFD700]/10 hover:border-[#FFD700] h-7 px-2 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Открыть
                        </Button>
                      </div>

                      {/* Client Information */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-base text-white mb-1">{order.clientName}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.city}
                          </span>
                        </div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Тип</p>
                          <p className="font-semibold text-white text-sm">
                            {order.typeEquipment === 'kp' ? 'КП' :
                             order.typeEquipment === 'bt' ? 'БТ' :
                             'МНЧ'}
                          </p>
                        </div>
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Дата</p>
                          <p className="font-semibold text-white text-sm">
                            {new Date(order.dateMeeting).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'UTC'
                            })}
                          </p>
                        </div>
                        <div className="bg-[#0f0f23] rounded p-2 border border-gray-700">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Оператор</p>
                          <p className="font-semibold text-white text-sm">{order.operator.name}</p>
                        </div>
                      </div>

                      {/* Problem Description */}
                      <div className="bg-[#FFD700]/10 rounded p-2 border-l-2 border-[#FFD700]">
                        <p className="text-xs font-medium text-[#FFD700] uppercase tracking-wide mb-1">Проблема</p>
                        <p className="text-xs text-gray-300">{order.problem}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
