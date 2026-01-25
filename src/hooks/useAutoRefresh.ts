'use client';

import { useState, useCallback } from 'react';
import { AvitoChat } from '@/types/avito';
import { logger } from '@/lib/logger';

export function useAutoRefresh() {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [chatsRefreshInterval, setChatsRefreshInterval] = useState<NodeJS.Timeout | null>(null);

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
    // Clear existing interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    // Start new interval - refresh every 5 minutes as fallback
    const interval = setInterval(() => {
      logger.log('Auto refresh tick - checking conditions');
      logger.log('Page visible:', isPageVisible());
      logger.log('User active:', isUserActive());
      
      // Обновляем только если страница видима и пользователь активен
      if (isPageVisible() && isUserActive()) {
        logger.log('Auto refreshing messages for chat:', chat.id);
        loadMessages(chat, true); // true = silent refresh
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
    // Clear existing interval
    if (chatsRefreshInterval) {
      clearInterval(chatsRefreshInterval);
    }

    // Start new interval - refresh every 60 seconds (увеличено с 30)
    const interval = setInterval(() => {
      // Обновляем только если страница видима и пользователь активен
      if (isPageVisible() && isUserActive()) {
        loadChats();
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
  }, [stopAutoRefresh, stopChatsAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
    startChatsAutoRefresh,
    stopChatsAutoRefresh,
    cleanup
  };
}
