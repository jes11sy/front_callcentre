'use client';

import { useState, useCallback, useRef } from 'react';

export function useMessageInput() {
  const [message, setMessage] = useState('');
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Оптимизированная функция изменения сообщения
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
  }, []);

  // Очистка сообщения после отправки
  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  // Фокус на поле ввода
  const focusInput = useCallback(() => {
    messageInputRef.current?.focus();
  }, []);

  return {
    message,
    messageInputRef,
    handleMessageChange,
    clearMessage,
    focusInput
  };
}
