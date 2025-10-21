'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsScript() {
  useEffect(() => {
    // Инициализируем Web Vitals мониторинг
    initWebVitals();
  }, []);

  return null;
}
