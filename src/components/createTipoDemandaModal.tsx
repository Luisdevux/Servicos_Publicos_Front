// src/components/createTipoDemandaModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CreateTipoDemandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;  
}

export function CreateTipoDemandaModal({ open, onOpenChange }: CreateTipoDemandaModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl"
        data-test="create-secretaria-dialog"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}

      >
        <DialogHeader className="bg-[var(--global-accent)] py-6 px-6 rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dialog-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white" />
                  <circle cx="0" cy="0" r="1" fill="white" />
                  <circle cx="60" cy="0" r="1" fill="white" />
                  <circle cx="0" cy="60" r="1" fill="white" />
                  <circle cx="60" cy="60" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dialog-grid)" />
            </svg>
          </div>

          <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

          <DialogTitle
            className="text-2xl font-bold text-center text-white drop-shadow-md relative z-10"
            data-test="create-secretaria-title"
          >
            Adicionar Novo Tipo de Demanda
          </DialogTitle>
        </DialogHeader>

      </DialogContent>
    </Dialog>
  );
}
