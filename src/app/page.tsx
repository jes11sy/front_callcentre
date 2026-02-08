'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Ждём гидратации store
    if (!_hasHydrated) return;
    
    // Если есть user - на телефонию
    if (user) {
      router.replace('/telephony');
      return;
    }
    
    // Если нет user и loading закончился - на логин
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router, _hasHydrated]);

  // Всегда показываем одинаковый UI при первом рендере (для гидратации)
  // Используем только статичные классы без dark: модификаторов
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02111B]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
        <p className="text-gray-400">Перенаправление...</p>
      </div>
    </div>
  );
}