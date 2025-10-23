'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notifications } from '@/components/ui/notifications';
import { useRouter } from 'next/navigation';
import { useGlobalSocket } from '@/hooks/useGlobalSocket';
// z import removed - not used
// Form imports removed - not used
import authApi from '@/lib/auth';
import { 
  LazyMessageList, 
  LazyChatList, 
  LazyChatHeader, 
  LazyQuickActions, 
  LazyNoChatSelected,
  LazyCreateOrderFromChatModal,
  LazyLinkedOrdersModal,
  LazySoundSettingsModal
} from '@/components/messages/LazyComponents';
import { ChatListSkeleton } from '@/components/messages/ChatListSkeleton';
// Убираем ненужные LazyWrapper'ы
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useSocketMessages } from '@/hooks/useSocketMessages';
import { MessageInputWrapper } from '@/components/messages/MessageInputWrapper';

// Types
import { 
  AvitoChat, 
  QuickReply, 
  LinkedOrder 
} from '@/types/avito';

// Form schemas removed - not used

export default function MessagesPage() {
  const router = useRouter();
  const { socket, isConnected } = useGlobalSocket();
  
  // Состояние скелетона чатов
  const [showChatsSkeleton, setShowChatsSkeleton] = useState(true);
  
  // Message input ref removed - not used
  
  // Use chats hook
  const {
    avitoAccounts,
    selectedAccount,
    chats,
    selectedChat,
    filterUnread,
    accountsLoading,
    chatsLoading,
    filteredChats,
    setSelectedAccount,
    setSelectedChat,
    setFilterUnread,
    loadAvitoAccounts,
    loadChats,
    markChatAsRead,
    markChatAsUnread,
    updateChatWithMessage
  } = useChats();
  
  // Use messages hook
  const {
    messages,
    messagesLoading,
    sendingMessage,
    shouldScroll,
    messagesEndRef,
    setMessages,
    setShouldScroll,
    loadMessages,
    sendMessage,
    handleMessageAction,
    addNewMessage
  } = useMessages();
  
  // Use auto-refresh hook
  const {
    startAutoRefresh,
    stopAutoRefresh,
    startChatsAutoRefresh,
    stopChatsAutoRefresh,
    cleanup
  } = useAutoRefresh();
  
  // UI state
  const [quickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  
  // Dialog states
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showLinkedOrdersModal, setShowLinkedOrdersModal] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [selectedChatForOrder, setSelectedChatForOrder] = useState<AvitoChat | null>(null);
  const [linkedOrders, setLinkedOrders] = useState<LinkedOrder[]>([]);
  const [linkedOrdersLoading, setLinkedOrdersLoading] = useState(false);
  
  // Refs removed - not used
  
  // Use Socket.IO hook
  useSocketMessages({
    socket: socket as { on: (event: string, callback: (...args: unknown[]) => void) => void; off: (event: string) => void } | null,
    isConnected,
    selectedChat,
    selectedAccount,
    onNewMessage: addNewMessage,
    onChatUpdate: () => {
      // Handle chat update by reloading chats silently
      loadChats(true);
    },
    loadChats,
    markChatAsUnread,
    updateChatWithMessage
  });

  
  // Modern utility functions
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesEndRef]);

  // scrollToMessage removed - not used



  const handleQuickReply = useCallback((_reply: QuickReply) => {
    if (selectedChat) {
      // TODO: Implement quick reply functionality
      setShowQuickReplies(false);
    }
  }, [selectedChat]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (selectedChat) {
      const success = await sendMessage(selectedChat, messageText);
      if (success) {
        // Update only the current chat instead of reloading all chats
        updateChatWithMessage(selectedChat.id, {
          id: Date.now().toString(),
          text: messageText,
          direction: 'out',
          created: Date.now(),
          type: 'text'
        });
      }
    }
  }, [selectedChat, sendMessage, updateChatWithMessage]);



  // handleFileUpload removed - not used

  // Auto-scroll effect
  useEffect(() => {
    if (shouldScroll && messages.length > 0) {
      scrollToBottom();
      setShouldScroll(false);
    }
  }, [messages, shouldScroll, scrollToBottom, setShouldScroll]);

  // Form removed - not used





  // Mark messages as read on Avito
  const markMessagesAsReadOnAvito = async (chat: AvitoChat) => {
    // Сначала обновляем локальное состояние сообщений
    setMessages(prevMessages => 
      prevMessages.map(msg => ({
        ...msg,
        isRead: true
      }))
    );
    
    // Mark chat as read in the chat list
    markChatAsRead(chat.id);
    
    // Потом отправляем запрос на сервер (в фоне)
    try {
      await authApi.post(`/avito-messenger/chats/${chat.id}/read`, {
        avitoAccountName: chat.avitoAccountName
      });
    } catch (error) {
      console.error('❌ Error marking messages as read on Avito:', error);
      // Не показываем ошибку пользователю, это фоновая операция
    }
  };

  // preloadMessagesAsRead removed - not used

  // Note: Unread status is now handled by useChats hook via double API requests
  // (one for all chats, one for unread_only=true to determine which chats have unread messages)



  // Function to load linked orders for a chat
  const loadLinkedOrders = async (chatId: string) => {
    try {
      setLinkedOrdersLoading(true);
      
      const response = await authApi.get(`/orders?avitoChatId=${chatId}`);
      
      if (response.data.success) {
        const orders = response.data.data?.orders || [];
        setLinkedOrders(orders);
      } else {
        throw new Error(response.data.message || 'Ошибка при получении привязанных заказов');
      }
    } catch (err: unknown) {
      console.error('Error loading linked orders:', err);
      notifications.error('Ошибка при загрузке привязанных заказов');
      setLinkedOrders([]);
    } finally {
      setLinkedOrdersLoading(false);
    }
  };


  // formatTimestamp removed - not used



  // isChatsLoading removed - not used
  
  // Отладочная информация убрана для production
  
  // Effects
  useEffect(() => {
    loadAvitoAccounts();
  }, [loadAvitoAccounts]);
  
  // Убираем ненужный эффект для полного скелетона страницы

  // Управляем показом скелетона чатов
  useEffect(() => {
    if (chats.length > 0) {
      // Если чаты загружены, скрываем скелетон сразу
      setShowChatsSkeleton(false);
    } else {
      // Если чатов нет, показываем скелетон
      setShowChatsSkeleton(true);
    }
  }, [chats.length]);

  // Отслеживание активности пользователя для умного автообновления
  useEffect(() => {
    const updateUserActivity = () => {
      localStorage.setItem('lastUserActivity', Date.now().toString());
    };

    // Обновляем активность при различных действиях пользователя
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateUserActivity, true);
      });
    };
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadChats();
      startChatsAutoRefresh(() => loadChats());
    } else {
      stopChatsAutoRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, filterUnread]);

  // Cleanup auto-refresh on component unmount or chat change
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [selectedChat, stopAutoRefresh]);

  // Stop auto-refresh when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);


  // Убираем полный скелетон страницы - показываем только кастомный скелетон списка чатов

  return (
    <DashboardLayout>
      <div className="fixed inset-0 top-16 flex bg-[#0f0f23] text-white overflow-hidden">
        {/* Left Sidebar - Chat List (Telegram Style) */}
        <div className="w-1/3 min-w-[20rem] max-w-[32rem] bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] flex flex-col hidden lg:flex m-2">
          {/* Quick Actions */}
          <LazyQuickActions
            onRefresh={() => loadChats()}
            onOpenSoundSettings={() => setShowSoundSettings(true)}
            loading={chatsLoading}
            filterUnread={filterUnread}
            onToggleFilterUnread={() => setFilterUnread(!filterUnread)}
            accounts={avitoAccounts}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
            accountsLoading={accountsLoading}
            onRetry={loadAvitoAccounts}
          />

          {/* Chat List */}
          <ScrollArea className="flex-1">
            {(() => {
              const shouldShowSkeleton = showChatsSkeleton;
              
              return shouldShowSkeleton ? (
                <ChatListSkeleton />
              ) : (
                <LazyChatList
                  chats={filteredChats}
                  selectedChat={selectedChat}
                  onChatSelect={async (chat) => {
                          setSelectedChat(chat);
                          markChatAsRead(chat.id);
                          // Загружаем сообщения
                          await loadMessages(chat);
                          // Потом помечаем их как прочитанные
                          await markMessagesAsReadOnAvito(chat);
                          startAutoRefresh(chat, loadMessages);
                        }}
                  loading={chatsLoading}
                  selectedAccount={selectedAccount}
                />
              );
            })()}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Right Content - Chat Area (Telegram Style) */}
          <div className="flex-1 flex flex-col bg-[#0f0f23] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] m-2 overflow-hidden">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center">
                <LazyNoChatSelected />
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <LazyChatHeader 
                  chat={selectedChat} 
                  onCreateOrder={() => {
                    setSelectedChatForOrder(selectedChat);
                    setShowCreateOrderModal(true);
                  }}
                  onShowLinkedOrders={() => {
                    if (selectedChat) {
                      loadLinkedOrders(selectedChat.id);
                      setShowLinkedOrdersModal(true);
                    }
                  }}
                  linkedOrdersCount={linkedOrders.length}
                />


                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <LazyMessageList
                    ref={messagesEndRef}
                    messages={messages}
                    selectedChat={selectedChat}
                    loading={messagesLoading}
                    onMessageAction={handleMessageAction}
                  />
                </ScrollArea>

                {/* Message Input */}
                <MessageInputWrapper
                  onSend={handleSendMessage}
                  sending={sendingMessage}
                  quickReplies={quickReplies}
                  showQuickReplies={showQuickReplies}
                  onToggleQuickReplies={() => setShowQuickReplies(!showQuickReplies)}
                  onQuickReply={handleQuickReply}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      <LazyCreateOrderFromChatModal
        chat={selectedChatForOrder}
        open={showCreateOrderModal}
        onOpenChange={setShowCreateOrderModal}
        onOrderCreated={(_order) => {
          notifications.success('Заказ успешно создан!');
          setShowCreateOrderModal(false);
        }}
      />

      {/* Sound Settings Modal */}
      <LazySoundSettingsModal
        open={showSoundSettings}
        onOpenChange={setShowSoundSettings}
      />

      {/* Linked Orders Modal */}
      <LazyLinkedOrdersModal
        open={showLinkedOrdersModal}
        onOpenChange={setShowLinkedOrdersModal}
        chat={selectedChatForOrder}
        orders={linkedOrders}
        loading={linkedOrdersLoading}
        onOrderClick={(orderId) => {
                              setShowLinkedOrdersModal(false);
          router.push(`/orders?orderId=${orderId}`);
        }}
      />
    </DashboardLayout>
  );
}