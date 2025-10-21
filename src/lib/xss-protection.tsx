// Утилиты для защиты от XSS атак
// Экранирование и санитизация пользовательских данных

/**
 * Экранирует HTML теги для предотвращения XSS
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
}

/**
 * Безопасно создает HTML строку с экранированием
 */
export function safeHtml(template: string, ...values: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const value = values[parseInt(index, 10)];
    return escapeHtml(String(value || ''));
  });
}

/**
 * Санитизирует объект, экранируя все строковые значения
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return escapeHtml(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key] as Record<string, unknown>);
      }
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Безопасно вставляет текст в DOM элемент
 */
export function setTextContent(element: HTMLElement, text: string): void {
  if (typeof window === 'undefined') return;
  
  // Очищаем элемент
  element.textContent = '';
  
  // Безопасно вставляем текст
  element.textContent = escapeHtml(text);
}

/**
 * Безопасно вставляет HTML в DOM элемент (только для доверенного контента)
 */
export function setInnerHTML(element: HTMLElement, html: string): void {
  if (typeof window === 'undefined') return;
  
  // В production лучше использовать DOMPurify для более сложной санитизации
  if (process.env.NODE_ENV === 'production') {
    // Здесь можно добавить DOMPurify
    element.innerHTML = html;
  } else {
    element.innerHTML = html;
  }
}

/**
 * Валидирует и санитизирует URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    // Разрешаем только безопасные протоколы
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '#';
    }
    
    return urlObj.toString();
  } catch {
    console.warn('Invalid URL:', url);
    return '#';
  }
}

/**
 * Валидирует email адрес
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }

  return escapeHtml(email);
}

/**
 * Валидирует телефонный номер
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  // Удаляем все символы кроме цифр, +, -, (, ), пробелов
  const cleaned = phone.replace(/[^\d+\-()\s]/g, '');
  
  // Проверяем минимальную длину
  if (cleaned.replace(/\D/g, '').length < 10) {
    return '';
  }

  return escapeHtml(cleaned);
}

/**
 * Создает безопасный атрибут для HTML элемента
 */
export function createSafeAttribute(name: string, value: string): string {
  const sanitizedName = escapeHtml(name);
  const sanitizedValue = escapeHtml(value);
  
  return `${sanitizedName}="${sanitizedValue}"`;
}

/**
 * Валидирует и санитизирует JSON данные
 */
export function sanitizeJson<T>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed) as T;
  } catch (error) {
    console.warn('Invalid JSON:', error);
    return null;
  }
}

/**
 * Проверяет, содержит ли строка потенциально опасный контент
 */
export function containsXSS(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<style[^>]*>.*?<\/style>/gi
  ];

  return xssPatterns.some(pattern => pattern.test(text));
}

/**
 * React компонент для безопасного отображения текста
 */
export function SafeText({ children, className }: { children: string; className?: string }) {
  if (typeof window === 'undefined') {
    return <span className={className}>{children}</span>;
  }

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: escapeHtml(children) }}
    />
  );
}

const xssProtection = {
  escapeHtml,
  safeHtml,
  sanitizeObject,
  setTextContent,
  setInnerHTML,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  createSafeAttribute,
  sanitizeJson,
  containsXSS,
  SafeText
};

export default xssProtection;
