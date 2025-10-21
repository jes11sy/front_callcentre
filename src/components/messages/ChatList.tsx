'use client';

import { useCallback, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Badge, Button, ScrollArea removed - not used
import { cn } from '@/lib/utils';
import { MessageSquare, Circle } from '@/lib/icons';
import { AvitoChat } from '@/types/avito';

interface ChatListProps {
  chats: AvitoChat[];
  selectedChat: AvitoChat | null;
  onChatSelect: (chat: AvitoChat) => void;
  loading?: boolean;
  selectedAccount?: string;
}

export const ChatList = memo(function ChatList({
  chats = [],
  selectedChat,
  onChatSelect,
  loading = false,
  selectedAccount = ''
}: ChatListProps) {
  const formatMessageTime = useCallback((timestamp: number | undefined) => {
    if (!timestamp) {
      return '';
    }
    
    try {
      // Проверяем, нужно ли умножать на 1000 (если timestamp в секундах)
      const date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Формат: день.месяц.год часы:минуты
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '';
    }
  }, []);

  // Мемоизированная функция для получения инициалов пользователя
  const getUserInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  // getMessageIcon removed - not used

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#F8F7F9]/70">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[#F8F7F9]" />
        <h3 className="text-lg font-medium text-[#F8F7F9] mb-2">
          {selectedAccount ? 'Нет чатов' : 'Выберите аккаунт'}
        </h3>
        <p className="text-[#F8F7F9] text-sm">
          {!selectedAccount 
            ? 'Выберите аккаунт Авито для просмотра чатов'
            : 'Новые чаты появятся здесь автоматически'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onChatSelect(chat)}
          className={cn(
            "flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 group relative rounded-lg mx-2",
            selectedChat?.id === chat.id 
              ? "bg-[#F8F7F9]/20 border border-[#F8F7F9] shadow-lg" 
              : "hover:bg-[#F8F7F9]/10 hover:border hover:border-[#F8F7F9]/20"
          )}
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-[#F8F7F9]/20">
              <AvatarImage src={chat.users?.[0]?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#F8F7F9] to-[#9EA93F] text-[#02111B] font-semibold">
                {getUserInitials(chat.users?.[0]?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            {/* Unread message indicator */}
            {chat.unreadCount && chat.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-[#02111B] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </span>
              </div>
            )}
            {/* New message dot (for visual indication) */}
            {chat.hasNewMessage && !chat.unreadCount && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#02111B] rounded-full flex items-center justify-center shadow-md">
                <Circle className="w-1.5 h-1.5 fill-white" />
              </div>
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-[#F8F7F9] flex-1 pr-2">
                {chat.users?.[0]?.name || 'Неизвестный пользователь'}
              </h3>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm text-[#F8F7F9] font-semibold whitespace-nowrap">
                  {formatMessageTime(chat.updated)}
                </span>
                {/* New message dot (only if no unread count) */}
                {chat.hasNewMessage && !chat.unreadCount && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1 shadow-sm" />
                )}
              </div>
            </div>

            {/* Item Title */}
            {chat.context?.value?.title && (
              <div className="mb-1">
                <div className="text-xs text-[#F8F7F9] font-medium leading-relaxed bg-[#F8F7F9]/20 px-2 py-1 rounded-md">
                  {chat.context.value.title}
                </div>
              </div>
            )}

            {/* Profile and City Info */}
            <div className="flex items-center gap-2 mb-1 text-xs text-[#F8F7F9]/80 flex-1 min-w-0">
              <span className="truncate font-medium">{chat.avitoAccountName}</span>
              <span className="text-[#F8F7F9]">•</span>
              <span className="truncate">{chat.city}</span>
            </div>

            {/* Last Message */}
            {chat.lastMessage && (
              <div className="flex items-start gap-2">
                <span className={cn(
                  "text-sm flex-1 leading-relaxed",
                  (chat.hasNewMessage || (chat.unreadCount && chat.unreadCount > 0))
                    ? "text-[#F8F7F9] font-medium" 
                    : "text-[#F8F7F9]/90"
                )}>
                  {chat.lastMessage.direction === 'out' && (
                    <span className="text-[#F8F7F9] mr-1 font-semibold">Вы:</span>
                  )}
                  {(() => {
                    const text = typeof chat.lastMessage.text === 'string' 
                      ? chat.lastMessage.text 
                      : (chat.lastMessage as { content?: { text?: string } }).content?.text || '';
                    return text.length > 48 ? text.substring(0, 48).trim() + '...' : text;
                  })()}
                </span>
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
});
