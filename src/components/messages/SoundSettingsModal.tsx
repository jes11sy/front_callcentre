'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { SoundSettings } from '@/components/ui/sound-settings';

interface SoundSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SoundSettingsModal({ open, onOpenChange }: SoundSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки звука
          </DialogTitle>
          <DialogDescription>
            Управление звуковыми уведомлениями для новых сообщений
          </DialogDescription>
        </DialogHeader>
        <SoundSettings />
      </DialogContent>
    </Dialog>
  );
}
