'use client';

import { useState, useCallback, forwardRef } from 'react';
import { MessageInput } from './MessageInput';

interface MessageInputWrapperProps {
  onSend: (message: string) => void;
  sending?: boolean;
}

export const MessageInputWrapper = forwardRef<HTMLTextAreaElement, MessageInputWrapperProps>(
  ({ onSend, sending = false }, ref) => {
    const [message, setMessage] = useState('');

    const handleChange = useCallback((value: string) => {
      setMessage(value);
    }, []);

    const handleSend = useCallback((messageText: string) => {
      onSend(messageText);
      setMessage('');
    }, [onSend]);

    return (
      <MessageInput
        ref={ref}
        value={message}
        onChange={handleChange}
        onSend={handleSend}
        sending={sending}
      />
    );
  }
);

MessageInputWrapper.displayName = 'MessageInputWrapper';
