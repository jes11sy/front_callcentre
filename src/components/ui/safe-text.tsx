// Безопасный компонент для отображения текста с защитой от XSS
'use client';

import { escapeHtml, containsXSS } from '@/lib/xss-protection';
import { AlertTriangle } from 'lucide-react';

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

  // Если контент безопасен или разрешен HTML
  if (allowHtml && !hasXSS) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  // По умолчанию экранируем HTML
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
