'use client';

import { forwardRef, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// cn removed - not used
import { Zap, ArrowRight } from '@/lib/icons';
import { QuickReply } from '@/types/avito';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  sending?: boolean;
  quickReplies?: QuickReply[];
  showQuickReplies?: boolean;
  onToggleQuickReplies?: () => void;
  onQuickReply?: (reply: QuickReply) => void;
}

const MessageInputComponent = memo(forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({
    value,
    onChange,
    onSend,
    sending = false,
    quickReplies = [],
    showQuickReplies = false,
    onToggleQuickReplies,
    onQuickReply
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
          <div className="flex-1 relative">
            <Textarea
              ref={ref}
              value={value}
              onChange={handleTextareaChange}
              placeholder="Напишите ответ клиенту..."
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none bg-[#F8F7F9]/20 border-[#F8F7F9]/30 text-[#F8F7F9] placeholder-white focus:border-[#F8F7F9]/30 focus:outline-none rounded-2xl pr-12 py-3"
            />
            
            {/* Quick Reply Button */}
            {quickReplies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleQuickReplies}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-[#F8F7F9] hover:text-[#9EA93F]"
              >
                <Zap className="h-4 w-4" />
              </Button>
            )}
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

        {/* Quick Replies */}
        {showQuickReplies && quickReplies.length > 0 && (
          <div className="mt-3 p-3 bg-[#F8F7F9]/20 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReply?.(reply)}
                  className="text-xs border-[#9EA93F] text-[#9EA93F] hover:bg-[#9EA93F] hover:text-[#02111B]"
                >
                  {reply.text}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
));

MessageInputComponent.displayName = 'MessageInput';

export const MessageInput = MessageInputComponent;
