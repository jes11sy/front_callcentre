'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Ждём монтирования на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Ждём монтирования и гидратации store
    if (!mounted || !_hasHydrated) return;
    
    // Если есть user - на телефонию
    if (user) {
      router.replace('/telephony');
    } else {
      // Нет user - на логин
      router.replace('/login');
    }
  }, [user, router, _hasHydrated, mounted]);

  // Статичный UI для SSR - без условий
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02111B]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
        <p className="text-gray-400">Перенаправление...</p>
      </div>
    </div>
  );
}