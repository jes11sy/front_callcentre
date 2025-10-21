'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Link, MapPin, User } from 'lucide-react';

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

interface ChatHeaderProps {
  chat: AvitoChat | null;
  onCreateOrder?: () => void;
  onShowLinkedOrders?: () => void;
  linkedOrdersCount?: number;
}

export function ChatHeader({ chat, onCreateOrder, onShowLinkedOrders, linkedOrdersCount = 0 }: ChatHeaderProps) {
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!chat) {
    return null;
  }

  return (
    <div className="bg-[#02111B] p-2 sm:p-4 flex items-center justify-between" style={{boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4), 0 1px 0 rgba(255, 215, 0, 0.6)'}}>
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <AvatarImage src={chat.users[0]?.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-[#F8F7F9] to-[#9EA93F] text-[#02111B] font-semibold text-xs sm:text-sm">
            {getUserInitials(chat.users[0]?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-[#F8F7F9] font-medium text-sm sm:text-base truncate">
            {chat.users[0]?.name || 'Неизвестный пользователь'}
          </h2>
          {chat.context?.value?.title && (
            <div className="mt-1">
              {chat.context.value.url ? (
                <button
                  onClick={() => window.open(chat.context?.value?.url, '_blank')}
                  className="text-xs sm:text-sm text-[#9EA93F] hover:text-[#F8F7F9] hover:underline truncate inline-block"
                >
                  {chat.context.value.title}
                </button>
              ) : (
                <p className="text-xs sm:text-sm text-[#F8F7F9]/80 flex-1 truncate">
                  {chat.context.value.title}
                </p>
              )}
            </div>
          )}
          
          {/* Profile Name and City */}
          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-[#F8F7F9]/80">
            <div className="flex items-center gap-1 min-w-0">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{chat.avitoAccountName}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{chat.city}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Create Order Button */}
        <Button
          variant="ghost"
          size="default"
          onClick={onCreateOrder}
          className="bg-[#F8F7F9]/20 text-[#F8F7F9] hover:text-[#02111B] hover:bg-[#F8F7F9] flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Заказ</span>
        </Button>

        {/* Linked Orders Button */}
        <Button
          variant="ghost"
          size="default"
          onClick={onShowLinkedOrders}
          className="bg-[#F8F7F9]/20 text-[#F8F7F9] hover:text-[#02111B] hover:bg-[#F8F7F9] flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 relative"
        >
          <Link className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Заказы</span>
          {linkedOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#9EA93F] text-[#02111B] text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-semibold">
              {linkedOrdersCount}
            </span>
          )}
        </Button>

      </div>
    </div>
  );
}
