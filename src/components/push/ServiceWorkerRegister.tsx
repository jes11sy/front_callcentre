'use client';

import { useEffect } from 'react';

/**
 * Компонент для регистрации Service Worker
 * Регистрирует SW при монтировании (кроме localhost в dev режиме)
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Проверяем поддержку
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    // Не регистрируем на localhost (dev режим)
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      console.log('[SW] Skipping registration on localhost');
      return;
    }

    // Регистрируем SW
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Registered successfully:', registration.scope);
        
        // Проверяем обновления сразу
        registration.update();
        
        // И каждый час
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });
  }, []);

  return null;
}
