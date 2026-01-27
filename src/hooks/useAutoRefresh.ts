'use client';

import { useState, useCallback, useRef } from 'react';
import { AvitoChat } from '@/types/avito';
import { logger } from '@/lib/logger';

export function useAutoRefresh() {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [chatsRefreshInterval, setChatsRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  // ✅ FIX: Используем refs для хранения актуальных значений, избегая stale closure
  const currentChatRef = useRef<AvitoChat | null>(null);
  const loadMessagesRef = useRef<((chat: AvitoChat, silent?: boolean) => Promise<void>) | null>(null);
  const loadChatsRef = useRef<(() => void) | null>(null);

  // Проверка видимости страницы
  const isPageVisible = useCallback(() => {
    return document.visibilityState === 'visible';
  }, []);

  // Проверка активности пользователя
  const isUserActive = useCallback(() => {
    const lastActivity = localStorage.getItem('lastUserActivity');
    if (!lastActivity) return true;
    
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity < 5 * 60 * 1000; // 5 минут
  }, []);

  // Auto-refresh messages for selected chat
  const startAutoRefresh = useCallback((chat: AvitoChat, loadMessages: (chat: AvitoChat, silent?: boolean) => Promise<void>) => {
    // ✅ FIX: Сохраняем актуальные значения в refs
    currentChatRef.current = chat;
    loadMessagesRef.current = loadMessages;
    
    // Clear existing interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    // Start new interval - refresh every 5 minutes as fallback
    const interval = setInterval(() => {
      logger.log('Auto refresh tick - checking conditions');
      logger.log('Page visible:', isPageVisible());
      logger.log('User active:', isUserActive());
      
      // ✅ FIX: Используем актуальные значения из refs
      const currentChat = currentChatRef.current;
      const currentLoadMessages = loadMessagesRef.current;
      
      // Обновляем только если страница видима и пользователь активен
      if (isPageVisible() && isUserActive() && currentChat && currentLoadMessages) {
        logger.log('Auto refreshing messages for chat:', currentChat.id);
        currentLoadMessages(currentChat, true); // true = silent refresh
      } else {
        logger.log('Skipping auto refresh - page not visible or user inactive');
      }
    }, 300000); // 5 минут - только как fallback

    setAutoRefreshInterval(interval);
  }, [autoRefreshInterval, isPageVisible, isUserActive]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  }, [autoRefreshInterval]);

  // Auto-refresh chats list
  const startChatsAutoRefresh = useCallback((loadChats: () => void) => {
    // ✅ FIX: Сохраняем актуальную функцию в ref
    loadChatsRef.current = loadChats;
    
    // Clear existing interval
    if (chatsRefreshInterval) {
      clearInterval(chatsRefreshInterval);
    }

    // Start new interval - refresh every 60 seconds (увеличено с 30)
    const interval = setInterval(() => {
      // ✅ FIX: Используем актуальную функцию из ref
      const currentLoadChats = loadChatsRef.current;
      
      // Обновляем только если страница видима и пользователь активен
      if (isPageVisible() && isUserActive() && currentLoadChats) {
        currentLoadChats();
      }
    }, 300000); // 5 минут - только как fallback

    setChatsRefreshInterval(interval);
  }, [chatsRefreshInterval, isPageVisible, isUserActive]);

  const stopChatsAutoRefresh = useCallback(() => {
    if (chatsRefreshInterval) {
      clearInterval(chatsRefreshInterval);
      setChatsRefreshInterval(null);
    }
  }, [chatsRefreshInterval]);

  // Cleanup all intervals
  const cleanup = useCallback(() => {
    stopAutoRefresh();
    stopChatsAutoRefresh();
    // ✅ FIX: Очищаем refs при cleanup
    currentChatRef.current = null;
    loadMessagesRef.current = null;
    loadChatsRef.current = null;
  }, [stopAutoRefresh, stopChatsAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
    startChatsAutoRefresh,
    stopChatsAutoRefresh,
    cleanup
  };
}
