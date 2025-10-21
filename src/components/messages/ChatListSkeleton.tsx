'use client';

// Скелетон для списка чатов
export function ChatListSkeleton() {
  return (
    <div className="p-4 animate-in fade-in duration-300">
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 hover:bg-[#2b2b2b]/50 transition-colors rounded-lg group">
            {/* Аватар */}
            <div className="w-12 h-12 bg-[#F8F7F9]/20 rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
            
            {/* Контент чата */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                {/* Имя пользователя */}
                <div className="h-4 bg-[#F8F7F9]/20 rounded w-32 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
                {/* Время */}
                <div className="h-3 bg-[#F8F7F9]/15 rounded w-12 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
              </div>
              
              {/* Последнее сообщение */}
              <div className="space-y-1">
                <div className="h-3 bg-[#F8F7F9]/15 rounded w-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
                <div className="h-3 bg-[#F8F7F9]/15 rounded w-3/4 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
              </div>
              
              {/* Статус (непрочитанные сообщения) */}
              <div className="flex items-center justify-between mt-2">
                <div className="h-3 bg-[#F8F7F9]/15 rounded w-16 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
                <div className="w-5 h-5 bg-[#FFD700]/30 rounded-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
