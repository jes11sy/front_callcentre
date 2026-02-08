'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  
  // Флаг для предотвращения ошибки гидратации - ждём монтирования на клиенте
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Не делаем редирект до монтирования компонента
    if (!isMounted) return;
    
    // ✅ PWA FIX: Если есть user - сразу редиректим, не ждём isLoading
    // Store инициализируется с user из localStorage синхронно
    if (user) {
      router.replace('/telephony');
      return;
    }
    
    // Если нет user и loading закончился - на логин
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router, isMounted]);

  // Всегда показываем одинаковый UI при первом рендере (для гидратации)
  // Это предотвращает ошибку React #418
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Перенаправление...</p>
      </div>
    </div>
  );
}