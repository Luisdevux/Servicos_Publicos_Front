'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName: string;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error && error.message 
        ? error.message 
        : 'Erro ao excluir item.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDeleting) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} data-test="delete-secretaria-modal">
      <DialogContent className="max-w-md" data-test="delete-secretaria-dialog">
        <DialogHeader className="text-center mb-2 flex flex-col items-center justify-center">
          <DialogTitle data-test="delete-secretaria-title">{title}</DialogTitle>
          <DialogDescription className="text-center mt-2" data-test="delete-secretaria-description">
            {description}{' '}
            <strong className="text-black" data-test="delete-secretaria-item-name">{itemName}</strong> ?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end" data-test="delete-secretaria-actions">
          <Button
            className="border-2 border-global-bg-select bg-white hover:bg-global-bg-select"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            data-test="delete-secretaria-cancel-button"
          >
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
            onClick={handleDelete}
            data-test="delete-secretaria-confirm-button"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

