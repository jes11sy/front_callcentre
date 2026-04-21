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

    // В dev режиме всегда отключаем SW и чистим старые регистрации/кэши
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((reg) => reg.unregister())))
        .catch((error) => {
          console.warn('[SW] Failed to unregister in dev:', error);
        });

      if ('caches' in window) {
        caches.keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch((error) => {
            console.warn('[SW] Failed to clear caches in dev:', error);
          });
      }

      console.log('[SW] Disabled in development mode');
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
