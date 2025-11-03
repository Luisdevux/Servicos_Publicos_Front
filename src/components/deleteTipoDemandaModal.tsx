'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { tipoDemandaService } from '@/services/tipoDemandaService';
import type { TipoDemandaModel } from '@/types';

interface DeleteTipoDemandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoDemanda: TipoDemandaModel | null;
  onSuccess?: () => void;
}

export function DeleteTipoDemandaModal({
  open,
  onOpenChange,
  tipoDemanda,
  onSuccess,
}: DeleteTipoDemandaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tipoDemanda?._id) return;
    
    setIsDeleting(true);
    try {
      if (tipoDemanda.link_imagem) {
        try {
          await tipoDemandaService.deletarFotoTipoDemanda(tipoDemanda._id);
        } catch (error) {
          console.warn('Erro ao deletar foto, continuando com exclusão do tipo de demanda:', error);
        }
      }

      await tipoDemandaService.deletarTipoDemanda(tipoDemanda._id);
      toast.success('Tipo de demanda excluído com sucesso!');
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao excluir tipo de demanda';
      toast.error(message);
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
          <DialogTitle>Excluir tipo de demanda</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Você tem certeza que deseja excluir o tipo de demanda{' '}
            <strong className="text-black">{tipoDemanda?.titulo ?? ''}</strong> ?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button
            className="border-2 border-[var(--global-bg-select)] bg-white hover:bg-[var(--global-bg-select)]"
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

