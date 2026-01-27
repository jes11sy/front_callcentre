// ✅ FIX #152: Безопасный компонент для отображения текста с защитой от XSS
// Использует DOMPurify для санитизации вместо unsafe dangerouslySetInnerHTML
'use client';

import DOMPurify from 'dompurify';
import { escapeHtml, containsXSS } from '@/lib/xss-protection';
import { AlertTriangle } from 'lucide-react';

// Конфигурация DOMPurify для безопасного HTML
const SAFE_HTML_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
  ADD_ATTR: ['target', 'rel'],
  FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
  ALLOW_DATA_ATTR: false,
};

interface SafeTextProps {
  children: string;
  className?: string;
  allowHtml?: boolean;
  showWarning?: boolean;
}

export function SafeText({ 
  children, 
  className = '', 
  allowHtml = false,
  showWarning = false 
}: SafeTextProps) {
  // Проверяем на потенциально опасный контент
  const hasXSS = containsXSS(children);
  
  if (hasXSS && showWarning) {
    console.warn('SafeText: Potentially dangerous content detected:', children);
  }

  // ✅ FIX #152: Если разрешен HTML - ВСЕГДА санитизируем через DOMPurify
  if (allowHtml) {
    const sanitizedHtml = DOMPurify.sanitize(children, SAFE_HTML_CONFIG);
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // По умолчанию экранируем HTML (безопасно)
  return (
    <span className={className}>
      {escapeHtml(children)}
    </span>
  );
}

interface SafeTextWithWarningProps extends SafeTextProps {
  showXSSWarning?: boolean;
}

export function SafeTextWithWarning({ 
  children, 
  className = '',
  showXSSWarning = false,
  ...props 
}: SafeTextWithWarningProps) {
  const hasXSS = containsXSS(children);

  return (
    <div className="flex items-center gap-2">
      <SafeText className={className} {...props}>
        {children}
      </SafeText>
      {hasXSS && showXSSWarning && (
        <AlertTriangle 
          className="h-4 w-4 text-yellow-500" 
        />
      )}
    </div>
  );
}

export default SafeText;
