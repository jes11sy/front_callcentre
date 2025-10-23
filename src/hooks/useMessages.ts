'use client';

import { useState, useCallback, useRef } from 'react';
import { authApi } from '@/lib/auth';
import { notifications } from '@/components/ui/notifications';
import { AvitoMessage, AvitoChat } from '@/types/avito';

export function useMessages() {
  const [messages, setMessages] = useState<AvitoMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load voice file URLs for voice messages
  const loadVoiceUrls = useCallback(async (messages: AvitoMessage[], chat: AvitoChat) => {
    const voiceMessages = messages.filter(msg => msg.type === 'voice' && msg.content?.voice?.voice_id);
    if (voiceMessages.length === 0) return messages;

    try {
      const voiceIds = voiceMessages.map(msg => msg.content?.voice?.voice_id).filter(Boolean);
      const response = await authApi.post(
        `/avito-messenger/voice-files?avitoAccountName=${chat.avitoAccountName}`,
        { voiceIds }
      );

      if (response.data.success) {
        const voiceUrls = response.data.data;
        return messages.map(msg => {
          if (msg.type === 'voice' && msg.content?.voice?.voice_id) {
            return {
              ...msg,
              voiceUrl: voiceUrls[msg.content.voice.voice_id]
            };
          }
          return msg;
        });
      }
    } catch (error) {
      console.error('Error loading voice URLs:', error);
    }
    return messages;
  }, []);

  // Load messages for selected chat
  const loadMessages = useCallback(async (chat: AvitoChat, silent = false) => {
    try {
      if (!silent) {
        setMessagesLoading(true);
      }
      
      const params = new URLSearchParams();
      if (chat.avitoAccountName) {
        params.append('avitoAccountName', chat.avitoAccountName);
      }
      params.append('limit', '50');
      params.append('offset', '0');

      const response = await authApi.get(`/avito-messenger/chats/${chat.id}/messages?${params.toString()}&_t=${Date.now()}`);
      
      if (response.data.success) {
        const messages = response.data.data?.messages || [];
        
        if (messages.length > 0) {
          const reversedMessages = messages.reverse(); // Reverse to show oldest first
          
          // Load voice URLs for voice messages
          const messagesWithVoice = await loadVoiceUrls(reversedMessages, chat);
          setMessages(messagesWithVoice);
          
          // Auto-scroll to show last message ONLY when opening chat (not on silent refresh)
          if (!silent) {
            setShouldScroll(true);
          }
        } else {
          setMessages([]);
        }
      } else {
        throw new Error(response.data.message || 'Ошибка при получении сообщений');
      }
    } catch (err: unknown) {
      console.error('Error loading messages:', err);
      if (!silent) {
        notifications.error('Ошибка при загрузке сообщений');
      }
    } finally {
      if (!silent) {
        setMessagesLoading(false);
      }
    }
  }, [loadVoiceUrls]);

  // Send message
  const sendMessage = useCallback(async (chat: AvitoChat, message: string) => {
    if (!message.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      const response = await authApi.post(`/avito-messenger/chats/${chat.id}/messages`, {
        avitoAccountName: chat.avitoAccountName,
        message: message.trim(),
        type: 'text'
      });

      if (response.data.success) {
        // Add sent message to messages list
        const sentMessage: AvitoMessage = response.data.data;
        setMessages(prev => [...prev, sentMessage]);
        notifications.success('Сообщение отправлено');
        
        // Trigger auto-scroll
        setShouldScroll(true);
        
        return true;
      } else {
        throw new Error(response.data.message || 'Ошибка при отправке сообщения');
      }
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      notifications.error('Ошибка при отправке сообщения');
      return false;
    } finally {
      setSendingMessage(false);
    }
  }, [sendingMessage]);

  // Handle typing
  const handleTyping = useCallback((_text: string) => {
    // TODO: Send typing indicator to server
  }, []);

  // Handle message action
  const handleMessageAction = useCallback((action: string, message: AvitoMessage) => {
    switch (action) {
      case 'reply':
        // TODO: Implement reply functionality
        messageInputRef.current?.focus();
        break;
      case 'forward':
        // TODO: Implement forward functionality
        break;
      case 'copy':
        navigator.clipboard.writeText(message.text);
        notifications.success('Сообщение скопировано');
        break;
      case 'edit':
        // TODO: Implement message editing
        break;
      case 'delete':
        // TODO: Implement message deletion
        break;
    }
  }, []);

  // Add new message from socket
  const addNewMessage = useCallback((message: AvitoMessage) => {
    setMessages(prev => [...prev, message]);
    setShouldScroll(true);
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // State
    messages,
    newMessage,
    messagesLoading,
    sendingMessage,
    shouldScroll,
    messagesEndRef,
    messageInputRef,
    setMessages,
    
    // Actions
    setNewMessage,
    setShouldScroll,
    loadMessages,
    sendMessage,
    handleTyping,
    handleMessageAction,
    addNewMessage,
    clearMessages
  };
}
