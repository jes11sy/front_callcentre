// Утилиты для защиты от XSS атак
// Использует DOMPurify для надежной санитизации
import DOMPurify from 'dompurify';

// Конфигурация DOMPurify для строгой санитизации
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [], // Не разрешаем никакие теги
  ALLOWED_ATTR: [], // Не разрешаем никакие атрибуты
  KEEP_CONTENT: true, // Сохраняем текстовое содержимое
};

// Конфигурация для HTML с ограниченным набором тегов
const SAFE_HTML_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span', 'a'],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
  ADD_ATTR: ['target', 'rel'],
  FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload'],
};

/**
 * Экранирует HTML теги для предотвращения XSS
 * Использует DOMPurify для надежной санитизации
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  return DOMPurify.sanitize(text, STRICT_CONFIG);
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
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
  
  // Используем textContent для безопасной вставки (не интерпретирует HTML)
  element.textContent = text;
}

/**
 * Безопасно вставляет HTML в DOM элемент с DOMPurify санитизацией
 */
export function setInnerHTML(element: HTMLElement, html: string): void {
  if (typeof window === 'undefined') return;
  
  // Используем DOMPurify для санитизации HTML
  element.innerHTML = DOMPurify.sanitize(html, SAFE_HTML_CONFIG);
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
  } catch {
    return null;
  }
}

/**
 * Проверяет, содержит ли строка потенциально опасный контент
 * Использует DOMPurify для проверки
 */
export function containsXSS(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  // Сравниваем оригинал с санитизированной версией
  const sanitized = DOMPurify.sanitize(text, STRICT_CONFIG);
  return text !== sanitized;
}

/**
 * React компонент для безопасного отображения текста
 */
export function SafeText({ children, className }: { children: string; className?: string }) {
  // Используем textContent подход - безопаснее чем dangerouslySetInnerHTML
  return (
    <span className={className}>
      {escapeHtml(children)}
    </span>
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
