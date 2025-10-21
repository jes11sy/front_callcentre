'use client';

import { useState, useCallback, useMemo } from 'react';
import { authApi } from '@/lib/auth';
import { notifications } from '@/components/ui/notifications';
import { AvitoAccount, AvitoChat, ChatFilter } from '@/types/avito';

export function useChats() {
  const [avitoAccounts, setAvitoAccounts] = useState<AvitoAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [chats, setChats] = useState<AvitoChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<AvitoChat | null>(null);
  const [filterUnread, setFilterUnread] = useState(false);
  const [chatFilter, setChatFilter] = useState<ChatFilter>({
    accountIds: [],
    tags: [],
    isArchived: false,
    hasUnread: false,
    status: 'all',
    priority: 'all',
    account: 'all',
    dateRange: { from: undefined, to: undefined }
  });
  
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Load Avito accounts
  const loadAvitoAccounts = useCallback(async () => {
    try {
      setAccountsLoading(true);
      const response = await authApi.get('/avito-messenger/accounts');
      
      if (response.data.success) {
        setAvitoAccounts(response.data.data);
        if (response.data.data.length > 0 && !selectedAccount) {
          if (response.data.data.length > 1) {
            setSelectedAccount('__ALL__');
          } else {
            setSelectedAccount(response.data.data[0].name);
          }
        }
      } else {
        throw new Error(response.data.message || 'Ошибка при получении аккаунтов');
      }
    } catch (err: unknown) {
      console.error('Error loading Avito accounts:', err);
      notifications.error('Ошибка при загрузке аккаунтов Авито: ' + ((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as { message?: string }).message || 'Неизвестная ошибка'));
    } finally {
      setAccountsLoading(false);
    }
  }, [selectedAccount]);

  // Load chats from all accounts
  const loadChatsFromAllAccounts = useCallback(async (silent = false) => {
    if (isLoadingChats) {
      return;
    }
    
    try {
      setIsLoadingChats(true);
      if (!silent) {
        setChatsLoading(true);
      }
      
      const chatPromises = avitoAccounts.map(async (account) => {
        try {
          // ВАЖНО: Делаем два запроса для каждого аккаунта
          // 1. Получаем все чаты
          const allChatsParams = new URLSearchParams({
            avitoAccountName: account.name,
            limit: '50',
            offset: '0',
            unread_only: 'false'
          });

          // 2. Получаем только непрочитанные чаты
          const unreadChatsParams = new URLSearchParams({
            avitoAccountName: account.name,
            limit: '50',
            offset: '0',
            unread_only: 'true'
          });

          const [allChatsResponse, unreadChatsResponse] = await Promise.all([
            authApi.get(`/avito-messenger/chats?${allChatsParams.toString()}`),
            authApi.get(`/avito-messenger/chats?${unreadChatsParams.toString()}`)
          ]);
          
          if (allChatsResponse.data.success && unreadChatsResponse.data.success) {
            const allChats = allChatsResponse.data.data.chats;
            const unreadChats = unreadChatsResponse.data.data.chats;
            
            // Создаем Set с ID непрочитанных чатов
            const unreadChatIds = new Set(unreadChats.map((chat: AvitoChat) => chat.id));
            
            return allChats.map((chat: AvitoChat) => ({
              ...chat,
              avitoAccountName: account.name,
              hasNewMessage: unreadChatIds.has(chat.id),
              unreadCount: unreadChatIds.has(chat.id) ? (chat.unreadCount || 1) : undefined,
              updated: chat.updated || Date.now() / 1000
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error loading chats for account ${account.name}:`, error);
          return [];
        }
      });

      const accountChats = await Promise.all(chatPromises);
      const allChats = accountChats.flat();
      
      // Дедупликация по уникальному ключу
      const uniqueChatsMap = new Map<string, AvitoChat>();
      
      allChats.forEach((chat: AvitoChat) => {
        const uniqueKey = `${chat.id}_${chat.avitoAccountName}`;
        if (!uniqueChatsMap.has(uniqueKey)) {
          uniqueChatsMap.set(uniqueKey, chat);
        }
      });
      
      const uniqueChats = Array.from(uniqueChatsMap.values())
        .sort((a, b) => {
          const timeA = (a as { last_message?: { created?: number } }).last_message?.created || a.lastMessage?.created || a.updated;
          const timeB = (b as { last_message?: { created?: number } }).last_message?.created || b.lastMessage?.created || b.updated;
          return timeB - timeA;
        });

      // Устанавливаем чаты с правильными флагами hasNewMessage
      setChats(uniqueChats);
      
      // Подсчитываем статистику непрочитанных чатов
      const _unreadCount = uniqueChats.filter(chat => chat.hasNewMessage).length;
      
    } catch (err: unknown) {
      console.error('Error loading chats from all accounts:', err);
      if (!silent) {
        notifications.error('Ошибка при загрузке чатов');
      }
    } finally {
      setIsLoadingChats(false);
      if (!silent) {
        setChatsLoading(false);
      }
    }
  }, [avitoAccounts, isLoadingChats]);

  // Load chats for selected account
  const loadChats = useCallback(async (silent = false) => {
    // loadChats called
    
    if (!selectedAccount) return;
    
    if (selectedAccount === '__ALL__') {
      return loadChatsFromAllAccounts(silent);
    }
    
    if (isLoadingChats) {
      // loadChats skipped - already loading
      return;
    }
    
    try {
      setIsLoadingChats(true);
      if (!silent) {
        setChatsLoading(true);
        // loadChats started
      }
      
      // ВАЖНО: Делаем два запроса для получения полной информации о непрочитанных чатах
      // 1. Получаем все чаты
      const allChatsParams = new URLSearchParams({
        avitoAccountName: selectedAccount,
        limit: '50',
        offset: '0',
        unread_only: 'false'
      });

      // 2. Получаем только непрочитанные чаты (для определения unread статуса)
      const unreadChatsParams = new URLSearchParams({
        avitoAccountName: selectedAccount,
        limit: '50',
        offset: '0',
        unread_only: 'true'
      });

      // Выполняем запросы параллельно
      const [allChatsResponse, unreadChatsResponse] = await Promise.all([
        authApi.get(`/avito-messenger/chats?${allChatsParams.toString()}`),
        authApi.get(`/avito-messenger/chats?${unreadChatsParams.toString()}`)
      ]);
      
      if (allChatsResponse.data.success && unreadChatsResponse.data.success) {
        const allChats = allChatsResponse.data.data.chats;
        const unreadChats = unreadChatsResponse.data.data.chats;
        
        // Создаем Set с ID непрочитанных чатов для быстрого поиска
        const unreadChatIds = new Set(unreadChats.map((chat: AvitoChat) => chat.id));
        
        // Loaded chats stats calculated
        
        // Используем функциональное обновление вместо зависимости от chats
        setChats(prevChats => {
          const updatedChats = allChats.map((chat: AvitoChat) => {
            const _existingChat = prevChats.find(c => c.id === chat.id);
            // Используем информацию из API об непрочитанных чатах
            const hasNewMessage = unreadChatIds.has(chat.id);
            
            return {
              ...chat,
              hasNewMessage: hasNewMessage,
              unreadCount: hasNewMessage ? (chat.unreadCount || 1) : undefined,
              updated: chat.updated || Date.now() / 1000
            };
          });
          return updatedChats;
        });
        
        // Если фильтр "только непрочитанные" включен, применяем его
        if (filterUnread) {
          setChats(prevChats => prevChats.filter(chat => unreadChatIds.has(chat.id)));
        }
      } else {
        throw new Error(allChatsResponse.data.message || 'Ошибка при получении чатов');
      }
    } catch (err: unknown) {
      console.error('Error loading chats:', err);
      if (!silent) {
        notifications.error('Ошибка при загрузке чатов');
      }
    } finally {
      setIsLoadingChats(false);
      if (!silent) {
        setChatsLoading(false);
        // loadChats completed
      }
    }
  }, [selectedAccount, filterUnread, loadChatsFromAllAccounts, isLoadingChats]);

  // Mark chat as read
  const markChatAsRead = useCallback((chatId: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, hasNewMessage: false, unreadCount: 0 }
          : chat
      )
    );
  }, []);

  // Mark chat as having new message
  const markChatAsUnread = useCallback((chatId: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              hasNewMessage: true, 
              unreadCount: (chat.unreadCount || 0) + 1,
              updated: Date.now() / 1000 // Update timestamp for sorting
            }
          : chat
      )
    );
  }, []);

  // Toggle chat star
  const toggleChatStar = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isStarred: !chat.isStarred }
        : chat
    ));
  }, []);

  // Toggle chat pin
  const toggleChatPin = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    ));
  }, []);

  // Update chat with new message
  const updateChatWithMessage = useCallback((chatId: string, message: { direction?: 'in' | 'out'; id?: string; content?: { text?: string }; text?: string; created?: number; type?: 'text' | 'system' | 'quick_reply' | 'voice'; authorId?: string }) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              hasNewMessage: message.direction === 'in',
              unreadCount: message.direction === 'in' ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
                lastMessage: {
                  id: message.id || '',
                  text: message.content?.text || message.text || '',
                  created: message.created || Date.now(),
                  direction: message.direction || 'in',
                  type: message.type || 'text',
                  authorId: message.authorId ? parseInt(message.authorId, 10) : 0,
                  isRead: false
                },
              updated: message.created || Date.now() / 1000
            }
          : chat
      );
      
      // Пересортировка: pinned > starred > по времени
      return updatedChats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return (b.updated || 0) - (a.updated || 0);
      });
    });
  }, []);

  // Advanced chat filtering
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {

      // Unread filter (from button)
      if (filterUnread && !(chat.hasNewMessage || (chat.unreadCount && chat.unreadCount > 0))) {
        return false;
      }

      // Status filter
      if (chatFilter.status !== 'all') {
        if (chatFilter.status === 'unread' && !(chat.hasNewMessage || (chat.unreadCount && chat.unreadCount > 0))) return false;
        if (chatFilter.status === 'starred' && !chat.isStarred) return false;
        if (chatFilter.status === 'archived' && !chat.isArchived) return false;
      }

      // Priority filter
      if (chatFilter.priority !== 'all' && chat.priority !== chatFilter.priority) {
        return false;
      }

      // Account filter
      if (chatFilter.account !== 'all' && chat.avitoAccountName !== chatFilter.account) {
        return false;
      }

      // Date range filter
      if (chatFilter.dateRange?.from || chatFilter.dateRange?.to) {
        const chatDate = new Date((chat.updated || 0) * 1000);
        if (chatFilter.dateRange.from && chatDate < chatFilter.dateRange.from) return false;
        if (chatFilter.dateRange.to && chatDate > chatFilter.dateRange.to) return false;
      }

      // Tags filter
      if (chatFilter.tags.length > 0) {
        const hasMatchingTag = chatFilter.tags.some(tag => 
          chat.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by pinned first, then by starred, then by last message time
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return (b.updated || 0) - (a.updated || 0);
    });
  }, [chats, chatFilter, filterUnread]);

  return {
    // State
    avitoAccounts,
    selectedAccount,
    chats,
    selectedChat,
    filterUnread,
    chatFilter,
    accountsLoading,
    chatsLoading,
    isLoadingChats,
    filteredChats,
    
    // Actions
    setSelectedAccount,
    setSelectedChat,
    setFilterUnread,
    setChatFilter,
    loadAvitoAccounts,
    loadChats,
    markChatAsRead,
    markChatAsUnread,
    toggleChatStar,
    toggleChatPin,
    updateChatWithMessage
  };
}
