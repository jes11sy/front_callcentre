'use client';

import { useState, useCallback, forwardRef } from 'react';
import { MessageInput } from './MessageInput';
import { QuickReply } from '@/types/avito';

interface MessageInputContainerProps {
  onSend: (message: string) => void;
  sending?: boolean;
  quickReplies?: QuickReply[];
  showQuickReplies?: boolean;
  onToggleQuickReplies?: () => void;
  onQuickReply?: (reply: QuickReply) => void;
}

export const MessageInputContainer = forwardRef<HTMLTextAreaElement, MessageInputContainerProps>(
  ({ onSend, sending = false, quickReplies = [], showQuickReplies = false, onToggleQuickReplies, onQuickReply }, ref) => {
    const [message, setMessage] = useState('');

    const handleChange = useCallback((value: string) => {
      setMessage(value);
    }, []);

    const handleSend = useCallback(() => {
      if (message.trim()) {
        onSend(message);
        setMessage('');
      }
    }, [message, onSend]);

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

MessageInputContainer.displayName = 'MessageInputContainer';


