'use client';

import { forwardRef, useCallback, useMemo, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// ScrollArea removed - not used
import { cn } from '@/lib/utils';
import { MessageSquare } from '@/lib/icons';
import { AvitoMessage, AvitoChat } from '@/types/avito';

interface MessageListProps {
  messages: AvitoMessage[];
  selectedChat: AvitoChat | null;
  loading?: boolean;
  onMessageAction?: (action: string, message: AvitoMessage) => void;
}

// Константы для виртуализации (reserved for future implementation)
// const MESSAGE_HEIGHT = 80;
// const CONTAINER_HEIGHT = 600;
// const OVERSCAN_COUNT = 5;

// Компонент отдельного сообщения для виртуализации
interface MessageItemProps {
  message: AvitoMessage;
  selectedChat: AvitoChat | null;
  index: number;
  isOwn: boolean;
  showAvatar: boolean;
  onMessageAction?: (action: string, message: AvitoMessage) => void;
}

const MessageItem = memo(({ message, selectedChat, index: _index, isOwn, showAvatar, onMessageAction: _onMessageAction }: MessageItemProps) => {
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('ru-RU', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "flex gap-3 group px-4 py-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedChat?.users?.[0]?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#F8F7F9] to-[#9EA93F] text-[#02111B] text-xs">
                {getUserInitials(selectedChat?.users?.[0]?.name || 'U')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}
      
      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl relative group/message",
            message.type === 'image' ? 'p-1' : 'px-4 py-2',
            isOwn 
              ? "bg-[#9EA93F] text-[#02111B]" 
              : "bg-[#F8F7F9]/20 text-[#F8F7F9]"
          )}
        >
          {/* Message Content by Type */}
          {message.type === 'image' && message.content?.image?.sizes ? (
            <div className="space-y-2">
              <img
                src={message.content.image.sizes['640x480'] || message.content.image.sizes['1280x960'] || Object.values(message.content.image.sizes)[0]}
                alt="Image"
                className="rounded-xl max-w-sm w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  const fullSizeUrl = message.content?.image?.sizes['1280x960'] || Object.values(message.content?.image?.sizes || {})[0];
                  if (fullSizeUrl) window.open(fullSizeUrl, '_blank');
                }}
              />
              {message.content.text && (
                <div className="text-sm whitespace-pre-wrap break-words px-3 pb-2">
                  {message.content.text}
                </div>
              )}
            </div>
          ) : message.type === 'voice' && message.voiceUrl ? (
            <div className="space-y-2">
              <audio controls className="w-full max-w-xs">
                <source src={message.voiceUrl} type="audio/mp4" />
                Ваш браузер не поддерживает аудио.
              </audio>
              {message.content?.text && (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content.text}
                </div>
              )}
            </div>
          ) : message.type === 'link' && message.content?.link ? (
            <div className="space-y-2">
              <a 
                href={message.content.link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {message.content.link.text || message.content.link.url}
              </a>
              {message.content.link.preview && (
                <div className="bg-black/20 rounded p-2 mt-2">
                  <div className="font-semibold text-sm">{message.content.link.preview.title}</div>
                  {message.content.link.preview.description && (
                    <div className="text-xs opacity-70 mt-1">{message.content.link.preview.description}</div>
                  )}
                </div>
              )}
            </div>
          ) : message.type === 'item' && message.content?.item ? (
            <div className="flex gap-2">
              {message.content.item.image_url && (
                <img src={message.content.item.image_url} alt={message.content.item.title} className="w-16 h-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{message.content.item.title}</div>
                {message.content.item.price_string && (
                  <div className="text-xs opacity-70">{message.content.item.price_string}</div>
                )}
              </div>
            </div>
          ) : message.type === 'location' && message.content?.location ? (
            <div className="space-y-2">
              <div className="text-sm">{message.content.location.title || message.content.location.text}</div>
              <a 
                href={`https://maps.google.com/?q=${message.content.location.lat},${message.content.location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-xs"
              >
                Открыть на карте
              </a>
            </div>
          ) : (
            /* Text Message */
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content?.text || message.text || '[Сообщение без текста]'}
            </div>
          )}

          {/* Message Time and Read Status */}
          <div className={cn(
            "text-xs mt-1 flex items-center gap-1",
            message.type === 'image' ? 'px-3 pb-2' : '',
            isOwn ? "text-[#02111B]/70" : "text-[#F8F7F9]/70"
          )}>
            <span>{formatMessageTime(message.created || message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, selectedChat, loading = false, onMessageAction }, ref) => {
    // Мемоизированные данные для виртуализации
    const messageData = useMemo(() => {
      return messages.map((message, index) => {
        const isOwn = message.direction === 'out';
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.direction !== message.direction;
        
        return {
          message,
          index,
          isOwn,
          showAvatar
        };
      });
    }, [messages]);

    // Рендер функция для виртуализированного списка
    const renderMessage = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
      const { message, isOwn, showAvatar } = messageData[index];
      
      return (
        <div style={style}>
          <MessageItem
            message={message}
            selectedChat={selectedChat}
            index={index}
            isOwn={isOwn}
            showAvatar={showAvatar}
            onMessageAction={onMessageAction}
          />
        </div>
      );
    }, [messageData, selectedChat, onMessageAction]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#F8F7F9]/70">Загрузка сообщений...</p>
          </div>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[#F8F7F9]" />
          <h3 className="text-lg font-medium text-[#F8F7F9] mb-2">Нет сообщений</h3>
          <p className="text-[#F8F7F9]/80 text-sm">
            Начните диалог с пользователем
          </p>
        </div>
      );
    }

    // Всегда используем одну и ту же структуру чтобы избежать резкого изменения DOM
    return (
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.direction === 'out';
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !prevMessage || prevMessage.direction !== message.direction;
          
          return (
            <MessageItem
              key={message.id}
              message={message}
              selectedChat={selectedChat}
              index={index}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onMessageAction={onMessageAction}
            />
          );
        })}
        <div ref={ref} />
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
