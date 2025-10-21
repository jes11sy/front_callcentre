'use client';

import { useState, useCallback, forwardRef } from 'react';
import { MessageInput } from './MessageInput';
import { QuickReply } from '@/types/avito';

interface MessageInputWrapperProps {
  onSend: (message: string) => void;
  sending?: boolean;
  quickReplies?: QuickReply[];
  showQuickReplies?: boolean;
  onToggleQuickReplies?: () => void;
  onQuickReply?: (reply: QuickReply) => void;
}

export const MessageInputWrapper = forwardRef<HTMLTextAreaElement, MessageInputWrapperProps>(
  ({ onSend, sending = false, quickReplies = [], showQuickReplies = false, onToggleQuickReplies, onQuickReply }, ref) => {
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
        quickReplies={quickReplies}
        showQuickReplies={showQuickReplies}
        onToggleQuickReplies={onToggleQuickReplies}
        onQuickReply={onQuickReply}
      />
    );
  }
);

MessageInputWrapper.displayName = 'MessageInputWrapper';
