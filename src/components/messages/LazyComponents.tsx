// Ленивые компоненты для code splitting
// Уменьшает размер initial bundle

import { lazy } from 'react';

// Ленивая загрузка тяжелых компонентов
export const LazyMessageList = lazy(() => 
  import('./MessageList').then(module => ({ default: module.MessageList }))
);

export const LazyChatList = lazy(() => 
  import('./ChatList').then(module => ({ default: module.ChatList }))
);

export const LazyMessageInput = lazy(() => 
  import('./MessageInput').then(module => ({ default: module.MessageInput }))
);

export const LazyChatHeader = lazy(() => 
  import('./ChatHeader').then(module => ({ default: module.ChatHeader }))
);

export const LazyQuickActions = lazy(() => 
  import('./QuickActions').then(module => ({ default: module.QuickActions }))
);

export const LazyNoChatSelected = lazy(() => 
  import('./NoChatSelected').then(module => ({ default: module.NoChatSelected }))
);

// Модальные окна
export const LazyCreateOrderFromChatModal = lazy(() => 
  import('./CreateOrderFromChatModal').then(module => ({ default: module.CreateOrderFromChatModal }))
);

export const LazyLinkedOrdersModal = lazy(() => 
  import('./LinkedOrdersModal').then(module => ({ default: module.LinkedOrdersModal }))
);

export const LazySoundSettingsModal = lazy(() => 
  import('./SoundSettingsModal').then(module => ({ default: module.SoundSettingsModal }))
);

// Дополнительные тяжелые компоненты
export const LazyAccountSelector = lazy(() => 
  import('./AccountSelector').then(module => ({ default: module.AccountSelector }))
);

export const LazyMessageInputContainer = lazy(() => 
  import('./MessageInputContainer').then(module => ({ default: module.MessageInputContainer }))
);

// Скелетоны для загрузки
export const LazyMessagesPageSkeleton = lazy(() => 
  import('./MessagesPageSkeleton').then(module => ({ default: module.MessagesPageSkeleton }))
);

export const LazyMessagesPageSkeletonMobile = lazy(() => 
  import('./MessagesPageSkeleton').then(module => ({ default: module.MessagesPageSkeletonMobile }))
);

export const LazyNoChatSelectedSkeleton = lazy(() => 
  import('./MessagesPageSkeleton').then(module => ({ default: module.NoChatSelectedSkeleton }))
);