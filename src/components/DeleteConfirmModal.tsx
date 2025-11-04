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
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDeleting) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center mb-2 flex flex-col items-center justify-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center mt-2">
            {description}{' '}
            <strong className="text-black">{itemName}</strong> ?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button
            className="border-2 border-global-bg-select bg-white hover:bg-global-bg-select"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

