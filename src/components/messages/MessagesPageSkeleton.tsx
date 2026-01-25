'use client';

import { cn } from '@/lib/utils';

// Стили для волновой анимации
const shimmerClass = `
  relative overflow-hidden
  before:absolute before:inset-0
  before:-translate-x-full
  before:animate-[shimmer_2s_infinite]
  before:bg-gradient-to-r
  before:from-transparent
  before:via-white/10
  before:to-transparent
`;

// Скелетон для отдельного элемента чата
function ChatItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-[#2b2b2b]/50 transition-colors rounded-lg group">
      {/* Аватар */}
      <div className={cn(
        "w-12 h-12 bg-[#F8F7F9]/20 rounded-full",
        shimmerClass
      )}></div>
      
      {/* Контент чата */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          {/* Имя пользователя */}
          <div className={cn(
            "h-4 bg-[#F8F7F9]/20 rounded w-32",
            shimmerClass
          )}></div>
          {/* Время */}
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-12",
            shimmerClass
          )}></div>
        </div>
        
        {/* Последнее сообщение */}
        <div className="space-y-1">
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-full",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-3/4",
            shimmerClass
          )}></div>
        </div>
        
        {/* Статус (непрочитанные сообщения) */}
        <div className="flex items-center justify-between mt-2">
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-16",
            shimmerClass
          )}></div>
          <div className={cn(
            "w-5 h-5 bg-[#FFD700]/30 rounded-full",
            shimmerClass
          )}></div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для списка чатов
function ChatListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </div>
  );
}

// Скелетон для заголовка чата
function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/20">
      <div className="flex items-center space-x-3">
        {/* Аватар */}
        <div className={cn(
          "w-10 h-10 bg-[#F8F7F9]/20 rounded-full",
          shimmerClass
        )}></div>
        
        {/* Информация о чате */}
        <div className="space-y-1">
          <div className={cn(
            "h-4 bg-[#F8F7F9]/20 rounded w-24",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-16",
            shimmerClass
          )}></div>
        </div>
      </div>
      
      {/* Кнопки действий */}
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          shimmerClass
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          shimmerClass
        )}></div>
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          shimmerClass
        )}></div>
      </div>
    </div>
  );
}

// Скелетон для сообщения
function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn(
      "flex mb-4",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
        isOwn 
          ? "bg-[#FFD700]/20 text-white" 
          : "bg-[#2b2b2b] text-white"
      )}>
        <div className="space-y-2">
          <div className={cn(
            "h-4 bg-white/20 rounded w-full",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-4 bg-white/20 rounded w-3/4",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-3 bg-white/15 rounded w-1/2",
            shimmerClass
          )}></div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для области сообщений
function MessagesAreaSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <MessageSkeleton 
          key={index} 
          isOwn={index % 3 === 0} 
        />
      ))}
    </div>
  );
}

// Скелетон для поля ввода сообщения
function MessageInputSkeleton() {
  return (
    <div className="p-4 border-t border-[#FFD700]/20">
      <div className="flex items-center space-x-3">
        {/* Кнопка прикрепления файла */}
        <div className={cn(
          "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
          shimmerClass
        )}></div>
        
        {/* Поле ввода */}
        <div className={cn(
          "flex-1 h-10 bg-[#2b2b2b] rounded-full",
          shimmerClass
        )}></div>
        
        {/* Кнопка отправки */}
        <div className={cn(
          "w-10 h-10 bg-[#FFD700]/30 rounded-full",
          shimmerClass
        )}></div>
      </div>
    </div>
  );
}

// Скелетон для быстрых действий
function QuickActionsSkeleton() {
  return (
    <div className="p-4 border-b border-[#FFD700]/20">
      <div className="flex items-center justify-between mb-4">
        {/* Заголовок */}
        <div className={cn(
          "h-6 bg-[#F8F7F9]/20 rounded w-32",
          shimmerClass
        )}></div>
        
        {/* Кнопки */}
        <div className="flex space-x-2">
          <div className={cn(
            "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
            shimmerClass
          )}></div>
          <div className={cn(
            "w-8 h-8 bg-[#F8F7F9]/20 rounded-full",
            shimmerClass
          )}></div>
        </div>
      </div>
      
      {/* Селектор аккаунта */}
      <div className="space-y-2">
        <div className={cn(
          "h-4 bg-[#F8F7F9]/15 rounded w-20",
          shimmerClass
        )}></div>
        <div className={cn(
          "h-10 bg-[#2b2b2b] rounded-lg",
          shimmerClass
        )}></div>
      </div>
    </div>
  );
}

// Основной скелетон страницы сообщений
export function MessagesPageSkeleton() {
  return (
    <div className="fixed inset-0 top-16 flex bg-[#0f0f23] text-white overflow-hidden">
      {/* Левая панель - Список чатов */}
      <div className="w-1/3 min-w-[20rem] max-w-[32rem] bg-[#17212b] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] flex flex-col hidden lg:flex m-2">
        {/* Быстрые действия */}
        <QuickActionsSkeleton />
        
        {/* Список чатов */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ChatListSkeleton />
          </div>
        </div>
      </div>

      {/* Правая панель - Область чата */}
      <div className="flex-1 flex flex-col bg-[#0f0f23] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] m-2 overflow-hidden">
        {/* Заголовок чата */}
        <ChatHeaderSkeleton />
        
        {/* Область сообщений */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <MessagesAreaSkeleton />
          </div>
        </div>
        
        {/* Поле ввода сообщения */}
        <MessageInputSkeleton />
      </div>
    </div>
  );
}

// Скелетон для мобильной версии
export function MessagesPageSkeletonMobile() {
  return (
    <div className="fixed inset-0 top-16 flex bg-[#0f0f23] text-white overflow-hidden">
      {/* Мобильная версия - только область чата */}
      <div className="flex-1 flex flex-col bg-[#0f0f23] rounded-3xl border border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] m-2 overflow-hidden">
        {/* Заголовок чата */}
        <ChatHeaderSkeleton />
        
        {/* Область сообщений */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <MessagesAreaSkeleton />
          </div>
        </div>
        
        {/* Поле ввода сообщения */}
        <MessageInputSkeleton />
      </div>
    </div>
  );
}

// Скелетон для состояния "нет выбранного чата"
export function NoChatSelectedSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Иконка */}
        <div className={cn(
          "w-16 h-16 bg-[#F8F7F9]/20 rounded-full mx-auto",
          shimmerClass
        )}></div>
        
        {/* Заголовок */}
        <div className="space-y-2">
          <div className={cn(
            "h-6 bg-[#F8F7F9]/20 rounded w-48 mx-auto",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-4 bg-[#F8F7F9]/15 rounded w-64 mx-auto",
            shimmerClass
          )}></div>
        </div>
        
        {/* Описание */}
        <div className="space-y-1">
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-56 mx-auto",
            shimmerClass
          )}></div>
          <div className={cn(
            "h-3 bg-[#F8F7F9]/15 rounded w-40 mx-auto",
            shimmerClass
          )}></div>
        </div>
      </div>
    </div>
  );
}
