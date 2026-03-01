'use client';

import { forwardRef, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from '@/lib/icons';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  sending?: boolean;
}

const MessageInputComponent = memo(forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({
    value,
    onChange,
    onSend,
    sending = false,
  }, ref) => {
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = value.trim();
        if (message) {
          onSend(message);
          onChange('');
        }
      }
    }, [value, onSend, onChange]);

    const handleSend = useCallback(() => {
      const message = value.trim();
      if (message) {
        onSend(message);
        onChange('');
      }
    }, [value, onSend, onChange]);

    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    }, [onChange]);

    return (
      <div className="bg-[#0f0f23] p-4">
        <div className="flex items-center gap-2">
          {/* Message Input */}
          <div className="flex-1">
            <Textarea
              ref={ref}
              value={value}
              onChange={handleTextareaChange}
              placeholder="Напишите ответ клиенту..."
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9] placeholder-white focus:border-[#F8F7F9]/30 focus:outline-none rounded-2xl py-3"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-[#9EA93F] hover:bg-[#8A8A3A] disabled:bg-[#F8F7F9]/20 disabled:cursor-not-allowed text-[#02111B] rounded-lg w-12 h-12 p-0 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }
));

MessageInputComponent.displayName = 'MessageInput';

export const MessageInput = MessageInputComponent;
