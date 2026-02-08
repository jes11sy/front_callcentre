'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
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
  }, [user, isLoading, router]);

  // ✅ Если user есть - ничего не показываем (мгновенный редирект)
  if (user) {
    return null;
  }

  // Показываем спиннер только если нет user и ещё loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Перенаправление...</p>
      </div>
    </div>
  );
}