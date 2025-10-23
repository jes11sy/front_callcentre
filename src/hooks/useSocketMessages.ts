'use client';

import { useEffect, useCallback } from 'react';
import { playMessageSound } from '@/lib/sound';
import { notifications } from '@/components/ui/notifications';
import { AvitoMessage, AvitoChat } from '@/types/avito';

interface UseSocketMessagesProps {
  socket: { on: (event: string, callback: (...args: unknown[]) => void) => void; off: (event: string) => void } | null;
  isConnected: boolean;
  selectedChat: AvitoChat | null;
  selectedAccount: string;
  onNewMessage: (message: AvitoMessage) => void;
  onChatUpdate: () => void;
  loadChats: (silent?: boolean) => void;
  markChatAsUnread: (chatId: string) => void;
  updateChatWithMessage: (chatId: string, message: AvitoMessage) => void;
}

export function useSocketMessages({
  socket,
  isConnected,
  selectedChat,
  selectedAccount,
  onNewMessage,
  onChatUpdate,
  loadChats,
  markChatAsUnread,
  updateChatWithMessage
}: UseSocketMessagesProps) {

  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('ru-RU', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('🔌 useSocketMessages: socket not ready', { socket: !!socket, isConnected });
      return;
    }

    console.log('🔌 useSocketMessages: setting up listeners', { socket: !!socket, isConnected });

    const newMessageHandler = (...args: unknown[]) => {
      const data = args[0] as { chatId: string; message: AvitoMessage };
      const isIncomingMessage = data.message.direction === 'in';
      console.log('✅ avito-new-message event received:', data);
      
      // ❌ Убрали звук отсюда - он будет только в avito-notification
      
      // If it's the currently open chat, add message to the list
      if (selectedChat && selectedChat.id === data.chatId) {
        const newMessage: AvitoMessage = {
          id: data.message.id,
          chatId: data.chatId,
          timestamp: data.message.created || Date.now(),
          isFromUser: data.message.direction === 'out',
          authorId: data.message.authorId,
          content: data.message.content,
          text: data.message.content?.text || '',
          created: data.message.created,
          createdFormatted: formatTimestamp(data.message.created || Date.now()),
          direction: data.message.direction,
          type: data.message.type,
          isRead: data.message.isRead || false, // Используем значение из webhook'а
          userId: data.message.userId
        };
        
        onNewMessage(newMessage);
      }
      
      // Update chat with new message
      updateChatWithMessage(data.chatId, data.message);
      
      // ❌ Убрали дублирующееся уведомление отсюда
      // Уведомление будет приходить только из avito-notification события
    };

    const chatUpdateHandler = (...args: unknown[]) => {
      const data = args[0] as {
        chatId: string;
        hasNewMessage?: boolean;
        unreadCount?: number;
        message?: AvitoMessage;
        lastMessage?: AvitoMessage;
        updated?: number;
        isNewChat?: boolean;
      };
      console.log('✅ avito-chat-updated event received:', data);
      // If it's the currently open chat and we have a new message, add it
      if (selectedChat && selectedChat.id === data.chatId && data.message) {
        const newMessage: AvitoMessage = data.message;
        
        onNewMessage(newMessage);
      }
      
      // Update chat with new message if provided
      if (data.message) {
        updateChatWithMessage(data.chatId, data.message);
      }
      
      // Trigger chat list reload only for new chats
      if (data.isNewChat) {
        loadChats(true); // Silent reload
      }
      
      onChatUpdate();
    };

    const notificationHandler = (...args: unknown[]) => {
      const data = args[0] as {
        type: string;
        chatId: string;
        messageId: string;
        message: AvitoMessage;
        timestamp: number;
      };
      // ❌ Уведомление теперь обрабатывается глобально в AvitoNotificationListener
      // Здесь только обновляем чат с новым сообщением если нужно
      if (data.message) {
        updateChatWithMessage(data.chatId, data.message);
        onChatUpdate();  // ← Обновляем список чатов
      }
    };

    socket.on('avito-new-message', newMessageHandler);
    socket.on('avito-chat-updated', chatUpdateHandler);
    socket.on('avito-notification', notificationHandler);

    // Cleanup
    return () => {
      socket.off('avito-new-message', newMessageHandler);
      socket.off('avito-chat-updated', chatUpdateHandler);
      socket.off('avito-notification', notificationHandler);
    };
  }, [socket, isConnected, selectedChat, selectedAccount, onNewMessage, onChatUpdate, loadChats, markChatAsUnread, updateChatWithMessage, formatTimestamp]);
}
