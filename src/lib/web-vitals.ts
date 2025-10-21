import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Функция для отправки метрик на сервер
function sendToAnalytics(metric: { name: string; value: number; id: string; delta: number }) {
  // В production можно отправлять на аналитический сервис
  if (process.env.NODE_ENV === 'production') {
    // Пример отправки на Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
    
    // Или отправка на собственный API
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }
}

// Инициализация мониторинга Web Vitals
export function initWebVitals() {
  // Cumulative Layout Shift (CLS)
  getCLS(sendToAnalytics);

  // First Input Delay (FID)
  getFID(sendToAnalytics);

  // First Contentful Paint (FCP)
  getFCP(sendToAnalytics);

  // Largest Contentful Paint (LCP)
  getLCP(sendToAnalytics);

  // Time to First Byte (TTFB)
  getTTFB(sendToAnalytics);
}

// Функция для ручного измерения производительности
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  const duration = end - start;
  
  if (duration > 100) { // Логируем только медленные операции
    console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
}

// Функция для измерения времени загрузки компонента
export function measureComponentLoad(componentName: string) {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    sendToAnalytics({
      name: 'component-load',
      value: duration,
      id: componentName,
      delta: duration,
    });
  };
}
