import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { AvitoAccount } from '@/types/avito';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount: AvitoAccount | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const DeleteAccountDialog = ({
  isOpen,
  onClose,
  selectedAccount,
  isSubmitting,
  onConfirm,
}: DeleteAccountDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить аккаунт</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить аккаунт &quot;{selectedAccount?.name}&quot;? Это действие необратимо.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
