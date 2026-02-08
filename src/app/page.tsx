'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Редирект только один раз
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    
    // Просто редиректим на логин - там проверка авторизации
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02111B]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
        <p className="text-gray-400">Перенаправление...</p>
      </div>
    </div>
  );
}